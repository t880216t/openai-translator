send_text() {
    curl -d "$POPCLIP_TEXT" --unix-socket /tmp/openai-translator.sock http://openai-translator
}

if ! send_text; then
    open -g -a AI\ Helper
    sleep 2
    send_text
fi
