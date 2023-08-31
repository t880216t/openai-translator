use isahc::prelude::*;
use isahc::HttpClient;
use scraper::{Html, Selector};
use serde::{Serialize, Deserialize};
use serde_json::Value;

#[derive(Serialize, Deserialize)]
pub struct SearchResult {
    title: String,
    content: String,
    link: String,
}

#[tauri::command]
pub fn fetch_web_content(url: String, requestType: String) -> Result<Vec<SearchResult>, String> {
    let client = HttpClient::builder()
        .default_header(
            "User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        )
        .build()
        .map_err(|err| err.to_string())?;

    let mut response = client.get(url.clone()).map_err(|err| err.to_string())?;

    // Check if the response contains a 'Location' header
    if let Some(location_header) = response.headers().get("Location") {
        // Extract the value of the 'Location' header as a string
        if let Ok(location_str) = location_header.to_str() {
            println!("Redirected to: {}", location_str);
        } else {
            println!("Failed to read 'Location' header value as string");
        }
    }

    println!("Status: {}", response.status());
    println!("Headers: {:?}", response.headers());

    let body = response.text().map_err(|err| err.to_string())?;

    match requestType.as_str() {
        "api" => parse_api_response(&body),
        _ => parse_html_response(&body),
    }
}

fn parse_api_response(response_body: &str) -> Result<Vec<SearchResult>, String> {
    let json_response: Value = serde_json::from_str(response_body).map_err(|err| err.to_string())?;

    let results: Vec<SearchResult> = json_response["data"]["documents"]["data"]
        .as_array()
        .unwrap_or(&Vec::new())
        .iter()
        .map(|result| SearchResult {
            title: result["techDocDigest"]["title"]
                .as_str()
                .unwrap_or_default()
                .to_string(),
            content: result["techDocDigest"]["summary"]
                .as_str()
                .unwrap_or_default()
                .to_string(),
            link: result["techDocDigest"]["url"]
                .as_str()
                .unwrap_or_default()
                .to_string(),
        })
        .collect();

    Ok(results)
}

fn parse_html_response(response_body: &str) -> Result<Vec<SearchResult>, String> {
    let document = Html::parse_document(response_body);
    let result_selector = Selector::parse("[class^=\"ant-list-item\"]").unwrap();

    let results: Vec<SearchResult> = document
        .select(&result_selector)
        .map(|elem| {
            let title = elem
                .select(&Selector::parse("[class^=\"title-root\"]").unwrap())
                .next()
                .map(|title_elem| title_elem.text().collect::<String>())
                .unwrap_or_default();

            let content = elem
                .select(&Selector::parse("[class^=\"summary-root\"]").unwrap())
                .next()
                .map(|content_elem| content_elem.text().collect::<String>())
                .unwrap_or_default();

            let link = elem
                .select(&Selector::parse("a").unwrap())
                .next()
                .and_then(|link_elem| link_elem.value().attr("href"))
                .map(|s| s.to_string())
                .unwrap_or_default();

            SearchResult {
                title,
                content,
                link,
            }
        })
        .collect();

    Ok(results)
}
