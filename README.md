# MementoMoriGuildHelper
 A tool based on Maintenance Mori(https://mentemori.icu)
 
 一个基于Maintenance Mori的工具，需要安装TamperMonkey来使用，大部分已支持五种文字，小部分只有中文和英文

 安装地址：
 
    稳定版：https://raw.githubusercontent.com/rainsillwood/MementoMoriGuildHelper/main/dist/GuildHelper.user.js
    
    开发版：https://raw.githubusercontent.com/rainsillwood/MementoMoriGuildHelper/main/extend/GuildHelper.user.js

# 功能介绍
 数据转换：选择MessagePack格式的二进制文件（如游戏的MB文件，抓包发包的数据），自动转化为可读的JSON格式，可一次性多选
 
 战斗布局：选好区域、群组、等级（本地为Local）、世界（跨服为四个Block）后可以进行如下点击操作
 
   从服务器获取：通过API从服务器获取地图信息
   
   从上一次恢复：从浏览器缓存恢复地图信息

   保存设置：以当前信息保存到浏览器缓存，包括公会颜色信息和城池信息

   表格中的第一列：点击可以设置公会代表色

   城池名称：添加Hint，格式为"你想说的话|想显示的图标代词"，不含引号，详见弹出的提示

   城池守方图标（盾）：显示进攻方

   城池攻方图标（剑）：隐藏进攻方

   城池攻防提示（顶部双剑）：反转攻守方（反击），且背景会显示为攻方公会颜色

   城池守方名称：更换守方公会，选好后按ESC确认

   城池攻方名称：更换攻方公会，选好后按ESC确认

   城池图片：无作用，但是背景会显示为守方公会颜色
