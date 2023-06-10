#!/bin/bash

# 获取所有以 popclip-* 开头且结尾不是 .popclipext 的文件夹
folders=$(find . -type d -name 'popclip-*' ! -name '*.popclipext')

# 遍历文件夹
for folder in $folders; do
    # 获取文件夹名称
    folder_name=$(basename "$folder")

    # 构建新的目标文件夹名称
    new_folder_name="${folder_name}.popclipext"

    # 检查目标文件夹是否存在
    if [ -d "$new_folder_name" ]; then
        # 如果目标文件夹已存在，则先删除
        echo "Deleting existing folder: $new_folder_name"
        rm -rf "$new_folder_name"
    fi

    # 复制文件夹
    echo "Copying folder: $folder -> $new_folder_name"
    cp -R "$folder" "$new_folder_name"
done