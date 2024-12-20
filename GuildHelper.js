// ==UserScript==
// @name         MementoMori Guild Helper
// @namespace    https://suzunemaiki.moe/
// @version      0.3
// @description  公会战小助手
// @author       SuzuneMaiki
// @match        http*://mentemori.icu/*
// @match        http*://*.mememori-boi.com/*
// @connect      mememori-boi.com
// @connect      cdn-mememori.akamaized.net
// @connect      mememori-game.com
// @connect      moonheart.dev
// @connect      githubusercontent.com
// @require      https://rawgit.com/kawanet/msgpack-lite/master/dist/msgpack.min.js
// @require      https://cdn.jsdelivr.net/npm/int64-buffer/dist/int64-buffer.min.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mememori-game.com
// @grant        GM_xmlhttpRequest
// @downloadURL  https://raw.githubusercontent.com/rainsillwood/MementoMoriGuildHelper/refs/heads/main/GuildHelper.js
// @updateURL    https://raw.githubusercontent.com/rainsillwood/MementoMoriGuildHelper/refs/heads/main/GuildHelper.js
// ==/UserScript==

(async function () {
  'use strict';
  const ListRegion = {
    'jp': {
      id: 0,
      Code: 'JP',
    },
    'kr': {
      id: 1,
      Code: 'KR',
    },
    'ap': {
      id: 2,
      Code: 'TW',
    },
    'us': {
      id: 3,
      Code: 'US',
    },
    'eu': {
      id: 4,
      Code: 'EN',
    },
    'gl': {
      id: 5,
      Code: 'CN',
    },
  };
  const ModelName = 'Xiaomi 2203121C';
  const OSVersion = 'Android OS 13 / API-33 (TKQ1.220829.002/V14.0.12.0.TLACNXM)';
  const authURL = 'https://prd1-auth.mememori-boi.com/api/auth/';
  let userURL;
  let MagicOnionHost;
  let MagicOnionPort;
  initPage();
  //const account = getStorage('Account') ? getStorage('Account') : await createUser();
  switch (document.URL) {
    case 'https://mentemori.icu/?function=fileConverter': {
      fileConverter();
      break;
    }
    case 'https://mentemori.icu/?function=gvgMapper': {
      gvgMapper();
      break;
    }
    case 'https://mentemori.icu/localgvg.html': {
      gvgHint('local');
      break;
    }
    case 'https://mentemori.icu/globalgvg.html': {
      gvgHint('global');
      break;
    }
  }
  //初始化功能
  //初始化页面
  async function initPage() {
    console.log('脚本运行中');
    //初始化导航栏
    let nav = createElement('nav');
    //初始化功能模块
    let div = createElement('div');
    //二进制文件转换功能
    let converter = createElement('a', '数据转换');
    converter.href = '/?function=fileConverter';
    div.appendChild(converter);
    //战斗布局功能
    div.appendChild(createElement('text', ' | '));
    let mapper = createElement('a', '战斗布局');
    mapper.href = '/?function=gvgMapper';
    div.appendChild(mapper);
    //插入功能模块
    nav.appendChild(div);
    //初始化账号管理模块
    let accountmanager = createElement('div');
    accountmanager.id = 'accountmanager';
    accountmanager.appendChild(createElement('a', '登录状态:'));
    //登录状态模块
    let accountlogger = createElement('a', '无账号');
    accountmanager.appendChild(accountlogger);
    //登录模块
    let login = createElement('button', '登录');
    login.id = 'login';
    login.onclick = loginAccount;
    accountmanager.appendChild(login);
    //登出模块
    let logout = createElement('button', '登出');
    logout.id = 'logout';
    logout.classList.add('hidden');
    logout.onclick = logoutAccount;
    accountmanager.appendChild(logout);
    //插入账号管理模块
    nav.appendChild(accountmanager);
    //插入导航栏
    document.body.insertBefore(nav, document.body.childNodes[1]);
    //插入分割线
    document.body.insertBefore(createElement('hr'), document.body.childNodes[1]);
    //获取语言模块
    let localdiv = document.getElementsByTagName('nav')[1].childNodes[3].childNodes[3];
    //插入中文模块
    localdiv.appendChild(createElement('text', ' | '));
    let zh = createElement('a', 'ZH');
    /*zh.href = '?lang=zh';*/
    localdiv.appendChild(zh);
    //初始化AppVersion
    const AppVersion = await getAppVersion();
    if (AppVersion) {
      setStorage('AppVersion', AppVersion);
    }
    //初始化ErrorCode
    const ErrorCode = await getErrorCode();
    if (ErrorCode) {
      setStorage('ErrorCode', JSON.stringify(ErrorCode));
    }
  }
  //初始化选择栏
  async function initSelect() {
    const NullOption = () => {
      let option = new Option('-'.repeat(80), -1)
      option.classList.add('static')
      return option;
    };
    let style = createElement('style');
    style.appendChild(createElement('text', `option{display:none}`))
    style.appendChild(createElement('text', `option.static{display:inline}`))
    style.appendChild(createElement('text', `select.NA option.static{display:inline}`))
    document.head.appendChild(style);
    let WorldGroup = await getWorldGroup();
    let div = createElement('div');
    let divRegion = createElement('p', 'Region : ');
    let listRegion = createElement('select');
    listRegion.id = 'listRegion';
    let divGroup = createElement('p', '-Group : ');
    let listGroup = createElement('select');
    listGroup.id = 'listGroup';
    let grand = createElement('p', '-Grand : ');
    let listGrand = createElement('select');
    listGrand.id = 'listGrand';
    let world = createElement('p', '-World : ');
    let listWorld = createElement('select');
    listWorld.id = 'listWorld';
    let getServer = createElement('button', `从服务器获取`);
    getServer.onclick = () => {
      const DataList = 0;
    };
    let getLocal = createElement('button', `从上一次恢复`);
    getServer.onclick = () => {
      const DataList = 0;
    };
    let setLocal = createElement('button', `保存设置`);
    getServer.onclick = () => {
      const DataList = 0;
    };
    const RegionList = WorldGroup.RegionList;
    const GroupList = WorldGroup.GroupList;
    const GrandList = {
      '1': {
        'Name': 'Local',
      },
      '2': {
        'Name': 'Elite',
      },
      '3': {
        'Name': 'Expert',
      },
      '4': {
        'Name': 'Master',
      }
    }
    const WorldList = WorldGroup.WorldList;
    const BlockList = {
      '1': {
        'Name': 'Block A',
      },
      '2': {
        'Name': 'Block B',
      },
      '3': {
        'Name': 'Block C',
      },
      '4': {
        'Name': 'Block D',
      },
    }
    listRegion.options.add(NullOption());
    for (let i in RegionList) {
      const Region = RegionList[i];
      const option = new Option(Region.Name, i)
      if (Region.GroupList.length > 0) {
        listRegion.options.add(option);
      }
    }
    listGroup.options.add(NullOption());
    for (let i in GroupList) {
      const Group = GroupList[i];
      if (Group.WorldList.length > 0) {
        const text = Group.WorldList.map((value) => {
          return `${WorldList[value].SName}`;
        });
        const option = new Option(`${Group.Name}(${text})`, i)
        option.classList.add(Group.Region)
        listGroup.options.add(option);
        if (Group.Name == 'Group NA') {
          listGrand.classList.add('NA')
        } else {
          listGrand.classList.remove('NA')
        }
      }
    }
    listGrand.options.add(NullOption());
    for (let i in GrandList) {
      const Grand = GrandList[i];
      const option = new Option(Grand.Name, i)
      option.classList.add(Group.Region)
      listGrand.options.add(option);
    }
    listWorld.options.add(NullOption());
    for (let i in WorldList) {
      const World = WorldList[i];
      const option = new Option(World.Name, i)
      option.classList.add('local')
      listWorld.options.add(option);
    }
    for (let i in BlockList) {
      const Block = BlockList[i];
      const option = new Option(Block.Name, i)
      option.classList.add('global')
      listWorld.options.add(option);
    }

    listRegion.onchange = () => {
      const RegionId = listRegion.options[listRegion.selectedIndex].value * 1;
    };
    listGroup.onchange = () => {
      const GroupId = listGroup.options[listGroup.selectedIndex].value;
    };
    listGrand.onchange = () => {
      const GrandId = listGrand.options[listGrand.selectedIndex].value;
    };
    listWorld.onchange = () => {
      const GrandId = listGrand.options[listGrand.selectedIndex].value;
      setStorage('RegionId', listRegion.options[listRegion.selectedIndex].value);
      setStorage('GroupId', listGroup.options[listGroup.selectedIndex].value);
      setStorage('GrandId', GrandId);
      setStorage('WorldId', listWorld.options[listWorld.selectedIndex].value);
      drawMap(GrandId);
    };
    divRegion.appendChild(listRegion);
    divGroup.appendChild(listGroup);
    grand.appendChild(listGrand);
    world.appendChild(listWorld);
    div.appendChild(divRegion);
    div.appendChild(divGroup);
    div.appendChild(grand);
    div.appendChild(world);
    document.body.appendChild(div);
    document.body.appendChild(createElement('hr'));
  }
  //主功能
  //文件转换
  function fileConverter() {
    //清除元素
    while (document.body.childNodes.length > 6) {
      document.body.lastChild.remove();
    }
    let divData = createElement('div');
    divData.setAttribute('style', 'width:100%;display:flex;flex-direction:column;flex-wrap: nowrap');
    let uploadButton = createElement('input');
    uploadButton.type = 'file';
    uploadButton.multiple = 'multiple';
    uploadButton.onchange = function () {
      for (let i = 0; i < this.files.length; i++) {
        let file = this.files[i];
        let filename = file.name;
        let reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = async () => {
          let buffer = reader.result;
          let view = new Uint8Array(buffer);
          let data = await msgpack.decode(view);
          let file = new Blob([JSON.stringify(data)], { type: 'text/plain' });
          let link = createElement('a', filename + '.json');
          let url = window.URL.createObjectURL(file);
          link.href = url;
          link.download = filename + '.json';
          divData.appendChild(link);
          divData.appendChild(createElement('br'));
        };
        reader.onerror = function () {
          console.log(reader.error);
        };
      }
    };
    divData.appendChild(uploadButton);
    divData.appendChild(createElement('br'));
    document.body.appendChild(divData);
  }
  //战斗布局
  async function gvgMapper() {
    //清除元素
    while (document.body.childNodes.length > 6) {
      document.body.lastChild.remove();
    }
    await initSelect();
    const Selected = {
      RegionId: getStorage('RegionId'),
      GroupId: getStorage('GroupId'),
      GrandId: getStorage('GrandId'),
      WorldId: getStorage('WorldId'),
    };
    if (Selected.WorldId * 1 > 0) {
      document.getElementById('listRegion').value = Selected.RegionId;
      document.getElementById('listGroup').value = Selected.GroupId;
      document.getElementById('listGrand').value = Selected.GrandId;
      document.getElementById('listWorld').value = Selected.WorldId;
    }
  }
  //登录账号
  async function loginAccount() {
    setStorage('ortegaaccesstoken', '');
    let Account = getStorage('Account');
    //若Account不存在
    if (!Account) {
      Account = {};
      const UserId = prompt('请输入引继码，若使用临时账号请留空');
      const ortegauuid = crypto.randomUUID().replaceAll('-', '');
      const AdverisementId = crypto.randomUUID();
      const AuthToken = await getAuthToken();
      const _createUser = await createUser(AuthToken, AdverisementId, ortegauuid);
      //若不使用引继码
      if (!UserId) {
        Account.ClientKey = _createUser.ClientKey;
        Account.UserId = UserId.toString();
        const _setUserSetting = await setUserSetting();
        const _createWorldPlayer = await createWorldPlayer();
        userURL = _createWorldPlayer.ApiHost;
        const _loginPlayer = await loginPlayer(_createWorldPlayer.PlayerId.toString(), _createWorldPlayer.Password);
      }
      //若使用引继码
      else {
        const Password = prompt('请输入引继码，若使用临时账号请留空');
        const _getComebackUserData = await getComebackUserData(FromUserId, UserId, Password, AuthToken);
      }
    }
    //若Account存在
    else {
    }
    getLoginState();
  }
  //登出账号
  function logoutAccount() {
    let confirm = prompt('真的要清除账号吗，请输入：确认清除');
    if (confirm == '确认清除') {
      setStorage('Account');
      setStorage('ortegauuid');
      setStorage('LoginState', false);
      setStorage('ortegaaccesstoken', '');
      this.classList.add('hidden');
      document.getElementById('login').classList.remove('hidden');
    }
  }
  //增加提示功能
  function gvgHint(grade) {
    document.getElementById('gvgHintStyle')?.remove();
    let style = createElement('style');
    style.id = 'gvgHintStyle';
    style.appendChild(createElement('text', 'gvg-castle-hint{left:-70px;right:-70px;background:rgba(32, 32, 32, 0.5);width:140px;color: white;position: absolute;display: block;font-size: 10px;text-align: center;}'));
    style.appendChild(createElement('text', `gvg-viewer[${grade}] gvg-castle[temple] >.gvg-castle-symbol{left:-70px;bottom:-58px;width:33px;height:29px;position: absolute;display: block;}`));
    style.appendChild(createElement('text', `gvg-viewer[${grade}] gvg-castle[castle] >.gvg-castle-symbol{left:-70px;bottom:-50px;width:33px;height:29px;position: absolute;display: block;}`));
    style.appendChild(createElement('text', `gvg-viewer[${grade}] gvg-castle[church] >.gvg-castle-symbol{left:-70px;bottom:-45px;width:33px;height:29px;position: absolute;display: block;}`));
    style.appendChild(createElement('text', `gvg-viewer[${grade}] gvg-castle[temple] >gvg-castle-hint{top:${58}px}`));
    style.appendChild(createElement('text', `gvg-viewer[${grade}] gvg-castle[castle] >gvg-castle-hint{top:${50}px}`));
    style.appendChild(createElement('text', `gvg-viewer[${grade}] gvg-castle[church] >gvg-castle-hint{top:${45}px}`));
    document.head.appendChild(style);
    let listCastal = document.getElementsByTagName('gvg-castle');
    for (let i = 0; i < listCastal.length; i++) {
      let castal = listCastal[i];
      //增加备注
      castal.getElementsByTagName('gvg-castle-name')[0].onclick = addHint;
      castal.getElementsByTagName('gvg-status-bar-defense')[0].onclick = changeContent;
      castal.getElementsByTagName('gvg-status-bar-offense')[0].onclick = changeContent;
      castal.getElementsByTagName('gvg-status-icon-defense')[0].onclick = showOffense;
      castal.getElementsByTagName('gvg-status-icon-offense')[0].onclick = hideOffense;
      castal.getElementsByTagName('gvg-castle-icon')[0].onclick = changeColor;
    }
  }
  //子功能
  function drawMap(GrandId) {
    const castalList = {
      'local': {
        '1': {
          'left': '640px',
          'top': '560px',
          'type': 'temple',
          'name': 'Brussell',
        },
        '2': {
          'left': '858px',
          'top': '514px',
          'type': 'castle',
          'name': 'Wissekerke',
        },
        '3': {
          'left': '741px',
          'top': '699px',
          'type': 'castle',
          'name': 'Modave',
        },
        '4': {
          'left': '422px',
          'top': '695px',
          'type': 'castle',
          'name': 'Chimay',
        },
        '5': {
          'left': '470px',
          'top': '433px',
          'type': 'castle',
          'name': 'Gravensteen',
        },
        '6': {
          'left': '708px',
          'top': '360px',
          'type': 'church',
          'name': 'Cambre',
        },
        '7': {
          'left': '1000px',
          'top': '280px',
          'type': 'church',
          'name': 'Quentin',
        },
        '8': {
          'left': '1145px',
          'top': '391px',
          'type': 'church',
          'name': 'Lambert',
        },
        '9': {
          'left': '1089px',
          'top': '600px',
          'type': 'church',
          'name': 'Saint-Jacques',
        },
        '10': {
          'left': '945px',
          'top': '690px',
          'type': 'church',
          'name': 'Michael',
        },
        '11': {
          'left': '815px',
          'top': '171px',
          'type': 'church',
          'name': 'Namur',
        },
        '12': {
          'left': '828px',
          'top': '872px',
          'type': 'church',
          'name': 'Charleroi',
        },
        '13': {
          'left': '761px',
          'top': '1092px',
          'type': 'church',
          'name': 'Alzette',
        },
        '14': {
          'left': '646px',
          'top': '969px',
          'type': 'church',
          'name': 'Hainaut',
        },
        '15': {
          'left': '560px',
          'top': '807px',
          'type': 'church',
          'name': 'Wavre',
        },
        '16': {
          'left': '435px',
          'top': '1008px',
          'type': 'church',
          'name': 'Mons',
        },
        '17': {
          'left': '261px',
          'top': '734px',
          'type': 'church',
          'name': 'Christophe',
        },
        '18': {
          'left': '186px',
          'top': '549px',
          'type': 'church',
          'name': 'Kortrijk',
        },
        '19': {
          'left': '258px',
          'top': '367px',
          'type': 'church',
          'name': 'Ypres',
        },
        '20': {
          'left': '358px',
          'top': '219px',
          'type': 'church',
          'name': 'Salvador',
        },
        '21': {
          'left': '563px',
          'top': '177px',
          'type': 'church',
          'name': 'Bavo',
        },
      },
      'global': {
        '1': {
          'left': '640px',
          'top': '560px',
          'type': 'temple',
          'name': 'Ein',
        },
        '2': {
          'left': '803px',
          'top': '503px',
          'type': 'castle',
          'name': 'Yesod',
        },
        '3': {
          'left': '747px',
          'top': '718px',
          'type': 'castle',
          'name': 'Malkuth',
        },
        '4': {
          'left': '418px',
          'top': '725px',
          'type': 'castle',
          'name': 'Keter',
        },
        '5': {
          'left': '484px',
          'top': '439px',
          'type': 'castle',
          'name': 'Tiferet',
        },
        '6': {
          'left': '691px',
          'top': '265px',
          'type': 'church',
          'name': 'Cushel',
        },
        '7': {
          'left': '986px',
          'top': '301px',
          'type': 'church',
          'name': 'Citri',
        },
        '8': {
          'left': '1144px',
          'top': '402px',
          'type': 'church',
          'name': 'Toppaz',
        },
        '9': {
          'left': '1107px',
          'top': '567px',
          'type': 'church',
          'name': 'Meral',
        },
        '10': {
          'left': '958px',
          'top': '627px',
          'type': 'church',
          'name': 'Perido',
        },
        '11': {
          'left': '891px',
          'top': '177px',
          'type': 'church',
          'name': 'Pharia',
        },
        '12': {
          'left': '906px',
          'top': '884px',
          'type': 'church',
          'name': 'Lapis',
        },
        '13': {
          'left': '743px',
          'top': '1131px',
          'type': 'church',
          'name': 'Larimal',
        },
        '14': {
          'left': '520px',
          'top': '1007px',
          'type': 'church',
          'name': 'Marin',
        },
        '15': {
          'left': '560px',
          'top': '851px',
          'type': 'church',
          'name': 'Amest',
        },
        '16': {
          'left': '309px',
          'top': '985px',
          'type': 'church',
          'name': 'Laven',
        },
        '17': {
          'left': '250px',
          'top': '728px',
          'type': 'church',
          'name': 'Zircon',
        },
        '18': {
          'left': '112px',
          'top': '602px',
          'type': 'church',
          'name': 'Onyx',
        },
        '19': {
          'left': '260px',
          'top': '420px',
          'type': 'church',
          'name': 'Floryte',
        },
        '20': {
          'left': '198px',
          'top': '259px',
          'type': 'church',
          'name': 'Ganette',
        },
        '21': {
          'left': '495px',
          'top': '158px',
          'type': 'church',
          'name': 'Rula',
        },
      },
    };
    document.getElementById('gvgMapStyle')?.remove();
    document.getElementById('gvg-viewer')?.remove();
    const Grand = GrandId == '1' ? 'local' : 'global';
    const image = Grand == 'local' ? 'base_ribbon_01' : 'base_metal';
    let style = createElement('style');
    style.id = 'gvgMapStyle';
    let styleList = [
      `gvg-status{width:164px;height:50px;position:relative;display:block}`,
      `gvg-status-icon-defense,gvg-status-icon-offense{display:block;width:32px;height:33px;text-align:center;line-height:37px;background-size:cover;color:#fff;font-size:12px}`,
      `gvg-status-icon-defense{background-image:url(assets/icon_gvg_party_defense.png)}`,
      `gvg-status-icon-offense{background-image:url(assets/icon_gvg_party_offense.png)}`,
      `gvg-status[active]>gvg-status-bar-defense,gvg-status[active]>gvg-status-bar-offense{display:block;width:90px;height:20px;padding:0 10px;background-size:cover;color:#fff;font-size:9px}`,
      `gvg-status-bar-offense{background-image:url(assets/base_s_09_red.png);text-align:left;line-height:16px}`,
      `gvg-status-bar-defense{background-image:url(assets/base_s_09_blue.png);text-align:right;line-height:24px}`,
      `gvg-status[neutral]>gvg-status-icon-defense{position:absolute;left:0;right:0;top:0;margin:auto}`,
      `gvg-status[neutral]>gvg-status-icon-offense{display:none}`,
      `gvg-status[neutral]>gvg-status-bar-defense{display:block;width:131px;height:12px;text-align:center;line-height:12px;background-image:url(assets/base_s_08_blue.png);background-size:cover;color:#fff;font-size:9px;position:absolute;left:0;right:0;top:35px;margin:auto}`,
      `gvg-status[neutral]>gvg-status-bar-offense{display:none}`,
      `gvg-status[active]>gvg-status-bar-offense {position:absolute;left:25px;bottom:10px }`,
      `gvg-status[active]>gvg-status-bar-defense {position:absolute;right:25px;bottom:0 }`,
      `gvg-status[active]>gvg-status-icon-offense {position:absolute;left:0;bottom:0 }`,
      `gvg-status[active]>gvg-status-icon-defense {position:absolute;right:0;bottom:0 }`,
      `gvg-castle>gvg-status{position:absolute;left:-82px;right:-82px;bottom:43px}`,
      `gvg-castle-icon{display:block;background-size:cover}`,
      `gvg-castle-name{display:block;background-size:cover;width:140px;height:26px;font-size:9px;text-align:center}`,
      `gvg-castle>gvg-castle-icon{position:absolute}`,
      `gvg-castle>gvg-castle-name{position:absolute}`,
      `gvg-castle{display:block;position:absolute;user-select:none}`,
      `gvg-viewer{display:block;position:relative;width:1280px;height:1280px;font-family:sans-serif;background-size:cover}`,
      `gvg-ko-count-container{position:absolute;width:76px;left:-38px;top:-19px;display:block;color:#eee;text-shadow:red 0 0 30px,red 0 0 5px}`,
      `gvg-ko-count{display:block;font-size:26px;text-align:center;width:100%}`,
      `gvg-ko-count-label:after{content:'KOs';font-size:14px;position:absolute;display:block;text-align:center;width:100%;height:14px;top:26px;left:0}`,
      `gvg-viewer[${Grand}] gvg-castle[church]>gvg-castle-icon{position:absolute;left:-28px;right:-28px;bottom:-25px;width:56px;height:50px;background-image:url(assets/Castle_0_0.png)}`,
      `gvg-viewer[${Grand}] gvg-castle[castle]>gvg-castle-icon{position:absolute;left:-31px;right:-31px;bottom:-33px;width:62px;height:67px;background-image:url(assets/Castle_0_1.png)}`,
      `gvg-viewer[${Grand}] gvg-castle[temple]>gvg-castle-icon{position:absolute;left:-39px;right:-39px;bottom:-40px;width:78px;height:80px;background-image:url(assets/Castle_0_2.png)}`,
      `gvg-viewer[${Grand}] gvg-castle-name{background-image:url(assets/${image}.png);width:140px;height:26px;color:${Grand == 'local' ? '#473d3b' : 'white'};line-height:33px}`,
      `gvg-viewer[${Grand}] gvg-castle>gvg-castle-name{left:-70px;right:-70px}`,
      `gvg-viewer[${Grand}] gvg-castle[church]>gvg-castle-name{bottom:-45px}`,
      `gvg-viewer[${Grand}] gvg-castle[castle]>gvg-castle-name{bottom:-50px}`,
      `gvg-viewer[${Grand}] gvg-castle[temple]>gvg-castle-name{bottom:-58px}`,
      `gvg-viewer[${Grand}]{background-image:url(assets/${Grand}gvg.png)}`,
    ];
    let viewer = createElement('gvg-viewer');
    viewer.setAttribute(Grand, '');
    let legend = createElement('div');
    legend.id = 'legend';
    legend.appendChild(createElement('div', '图例'));
    legend.setAttribute('style', 'background-color:rgba(255,255,255,0.5);width:275px');
    viewer.appendChild(legend);
    for (let i in castalList[Grand]) {
      let castal = castalList[Grand][i];
      let castleNode = createElement('gvg-castle');
      castleNode.setAttribute('castle-id', i);
      castleNode.setAttribute(castal.type, 'true');
      let status = createElement('gvg-status');
      status.setAttribute('neutral', '');
      status.appendChild(createElement('gvg-status-bar-offense'));
      status.appendChild(createElement('gvg-status-bar-defense'));
      status.appendChild(createElement('gvg-status-icon-offense', 0));
      status.appendChild(createElement('gvg-status-icon-defense', 0));
      castleNode.appendChild(status);
      castleNode.appendChild(createElement('gvg-castle-icon'));
      castleNode.appendChild(createElement('gvg-castle-name', castal.name));
      let kos = createElement('gvg-ko-count-container');
      kos.classList.add('hidden');
      kos.appendChild(createElement('gvg-ko-count', 0));
      kos.appendChild(createElement('gvg-ko-count-label'));
      castleNode.appendChild(kos);
      viewer.appendChild(castleNode);
      styleList.push(`gvg-viewer[${Grand}] gvg-castle[castle-id="${i}"]{left:${castal.left};top:${castal.top}}`);
    }
    for (let i = 0; i < styleList.length; i++) {
      style.appendChild(createElement('text', styleList[i]));
    }
    document.head.appendChild(style);
    document.body.appendChild(viewer);
    gvgHint(Grand);
  }
  //战斗布局-增加提示
  async function addHint() {
    let exist = this.parentNode.getElementsByTagName('gvg-castle-hint')[0];
    let image = this.parentNode.getElementsByClassName('gvg-castle-symbol')[0];
    let hint = prompt('输入添加的提示，然后输入|，再输入标识代码（A1：攻击1；A2：攻击2；D1：防御1；D2：防御2；FB：禁止；NN：旗帜）', exist ? exist.innerHTML : '');
    if (hint == '' || hint == undefined) {
      exist.remove();
      return;
    }
    hint = hint.split('|');
    if (!exist) {
      exist = createElement('gvg-castle-hint', hint[0]);
      this.parentNode.appendChild(exist);
    } else {
      exist.innerHTML = hint[0];
    }
    if (image) {
      image.remove();
    } else {
      image = createElement('img');
      image.classList.add('gvg-castle-symbol');
    }
    if ('A1|A2|D1|D2|FB|NN'.includes(hint[1])) {
      image.src = `https://raw.githubusercontent.com/rainsillwood/MementoMoriGuildHelper/refs/heads/main/${hint[1]}.png`;
      this.parentNode.appendChild(image);
    }
  }
  //战斗布局-改变内容
  function changeContent() {
    let hint = prompt('输入修改内容', this.innerHTML);
    if (hint != '' && hint != undefined && hint != null) {
      this.innerHTML = hint;
    }
  }
  //战斗布局-显示进攻方
  function showOffense() {
    this.parentNode.removeAttribute('neutral');
    this.parentNode.setAttribute('active', '');
  }
  //战斗布局-隐藏进攻方
  function hideOffense() {
    this.parentNode.removeAttribute('active');
    this.parentNode.setAttribute('neutral', '');
  }
  //战斗布局-改变势力颜色
  function changeColor() {
    let color = prompt('输入颜色:R(0-255),G(0-255),B(0-255),A(0-1)', this.innerHTML).split(',');
    if (color) {
      this.setAttribute('style', `background-color: rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`);
    }
    let div = document.getElementById(color.join('_'));
    if (!div) {
      div = createElement('div');
      div.id = color.join('_');
      let square = createElement('a', '█');
      square.setAttribute('style', `color:rgb(${color[0]}, ${color[1]}, ${color[2]})`);
      square.ondblclick = function () {
        this.parentNode.remove();
      };
      div.appendChild(square);
      let commment = createElement('a', '点击此处输入图例');
      commment.onclick = changeContent;
      div.appendChild(commment);
      document.getElementById('legend').appendChild(div);
    }
  }
  //登陆账号-检查登陆状态
  async function getLoginState() {
    const _getUserData = await getUserData();
    let accountmanager = document.getElementById('accountmanager');
    if (_getUserData.UserSyncData.UserStatusDtoInfo) {
      accountmanager.childNodes[1].innerHTML = `已登录 ${_getUserData.UserSyncData.UserStatusDtoInfo.Name}`;
      accountmanager.childNodes[2].classList.add('hidden');
      accountmanager.childNodes[3].classList.remove('hidden');
      return true;
    } else {
      accountmanager.childNodes[1].innerHTML = `未登录`;
      accountmanager.childNodes[3].classList.add('hidden');
      accountmanager.childNodes[2].classList.remove('hidden');
      return false;
    }
  }
  //API函数
  //获取option
  function buildOption() {
    let option = {
      method: 'POST',
      headers: {
        'ortegaaccesstoken': getStorage('ortegaaccesstoken'), //从cookie获取
        'ortegaappversion': getStorage('AppVersion'), //跟随版本
        'ortegadevicetype': 2, //固定为2
        'ortegauuid': getStorage('ortegauuid'), //随机uuid，登录后绑定账号
        //'Host':'*.mememori-boi.com', //自动
        'Content-Type': 'application/json; charset=UTF-8', //固定
        'Accept-Encoding': 'gzip', //固定
        'User-Agent': 'BestHTTP/2 v2.3.0', //固定
        //'Content-Length':399, //自动
      },
      type: 'arraybuffer',
      msgpack: true,
      //body: null, //消息体
    };
    return option;
  }
  //获取apkversion
  async function getAppVersion() {
    let option = buildOption();
    const varjs = await sendGMRequest('https://mememori-game.com/apps/vars.js', {});
    if (!varjs) {
      console.log('获取var.js失败');
      alert('获取var.js失败，请重试');
    } else {
      const apkVersion = getVariable(varjs, 'apkVersion').split('.');
      let max = 20;
      for (let i = 0; i < max + 1; i++) {
        //版本号递增
        apkVersion[2] = apkVersion[2] * 1 + i;
        option.headers.ortegaappversion = apkVersion.join('.');
        //最后一次手动请求版本号
        if (i == max) {
          option.headers.ortegaappversion = prompt('版本号不在正常范围内，请手动输入版本号', option.headers.ortegaappversion);
        }
        //请求getDataUri
        let result = await getDataUri(option);
        //正确
        if (!result.ErrorCode) {
          //存储版本号
          return option.headers.ortegaappversion;
        }
      }
    }
  }
  //获取错误码
  async function getErrorCode() {
    const buffer = await sendGMRequest(`https://cdn-mememori.akamaized.net/master/prd1/version/${getStorage('MasterVersion')}/TextResourceZhTwMB`, { type: 'arraybuffer', msgpack: true });
    const TextResourceZhTwMB = await msgpack.decode(new Uint8Array(buffer));
    if (!TextResourceZhTwMB) return;
    let result = {};
    for (let i = 0; i < TextResourceZhTwMB.length; i++) {
      const TextResourceZhTw = TextResourceZhTwMB[i];
      if (TextResourceZhTw.StringKey.includes('ErrorMessage')) {
        result[TextResourceZhTw.StringKey.replace(/\[ErrorMessage(.*?)\]/, '$1') * 1] = TextResourceZhTw.Text;
      }
    }
    return result;
  }
  //获取世界组
  async function getWorldGroup() {
    const buffer = await sendGMRequest(`https://cdn-mememori.akamaized.net/master/prd1/version/${getStorage('MasterVersion')}/WorldGroupMB`, { type: 'arraybuffer', msgpack: true });
    const WorldGroupMB = await msgpack.decode(new Uint8Array(buffer));
    const RegionList = { 'jp': 'Japan', 'kr': 'Korea', 'ap': 'Asia', 'us': 'America', 'eu': 'Europe', 'gl': 'Global' };
    const RegionIdList = { 'jp': 0, 'kr': 2, 'ap': 3, 'us': 4, 'eu': 5, 'gl': 6 };
    let result = {
      'RegionList': {},
      'GroupList': {},
      'WorldList': {},
    };
    for (let i = 0; i < WorldGroupMB.length; i++) {
      const WorldGroup = WorldGroupMB[i];
      const RegionMemo = WorldGroup.Memo;
      const RegionId = RegionIdList[RegionMemo].toString();
      const WorldIdList = WorldGroup.WorldIdList;
      if (new Date(WorldGroup.EndTime) > new Date()) {
        let region = result.RegionList[RegionId];
        if (!region) {
          region = {
            'Name': RegionList[RegionMemo],
            'SName': RegionMemo,
            'WorldList': [],
            'GroupList': [`N${RegionId}`],
          };
          result.RegionList[RegionId] = region;
          result.GroupList[`N${RegionId}`] = {
            'Name': `Group NA`,
            'SName': `GNA`,
            'Region': RegionId,
            'WorldList': [],
          };
        }
        const GroupId = WorldGroup.Id.toString();
        let group = result.GroupList[GroupId];
        if (!group) {
          group = {
            'Region': RegionId,
            'Name': `Group ${GroupId}`,
            'SName': `G${GroupId}`,
            'WorldList': [],
          };
          result.GroupList[GroupId] = group;
        }
        region.GroupList.push(GroupId);
        for (let j = 0; j < WorldIdList.length; j++) {
          const WorldId = WorldIdList[j].toString();
          region.WorldList.push(WorldId);
          let world = {
            'Name': `World ${WorldId % 1000}`,
            'SName': `W${WorldId % 1000}`,
            'Region': RegionId,
            'Group': GroupId,
          };
          result.WorldList[WorldId] = world;
          region.WorldList.push(WorldId);
          group.WorldList.push(WorldId);
        }
      }
    }
    const _getDataUri = await getDataUri();
    for (let i = 0; i < _getDataUri.WorldInfos.length; i++) {
      const World = _getDataUri.WorldInfos[i];
      const GameServerId = World.GameServerId;
      const RegionId = Math.floor(GameServerId / 10).toString();
      const WorldId = World.Id.toString();
      let region = result.RegionList[RegionId];
      region.WorldList.push(WorldId);
      let world = result.WorldList[WorldId];
      if (world) {
        world.GameServerId = GameServerId;
      } else {
        const GroupId = `N${RegionId}`;
        result.GroupList[GroupId].WorldList.push(WorldId);
        result.WorldList[WorldId] = {
          'Name': `World ${WorldId % 1000}`,
          'SName': `W${WorldId % 1000}`,
          'Region': RegionId,
          'Group': GroupId,
          'GameServerId': GameServerId,
        };
      }
    }
    return result;
  }
  //获取AuthToken
  async function getAuthToken() {
    let jsonAuthTokenData = await sendGMRequest('https://list.moonheart.dev/d/public/mmtm/AddressableLocalAssets/ScriptableObjects/AuthToken/AuthTokenData.json?v=' + Date.now(), { type: 'json' });
    if (!jsonAuthTokenData) {
      console.log('获取AuthToken失败');
      alert('获取AuthToken失败，请重试');
    }
    return jsonAuthTokenData._authToken;
  }
  //https://prd1-auth.mememori-boi.com/api/auth/getDataUri
  async function getDataUri(defaultOpting) {
    //生成配置
    let option = defaultOpting ? defaultOpting : buildOption();
    //随机ortegauuid
    option.headers.ortegauuid = crypto.randomUUID().replaceAll('-', '');
    //不设ortegaaccesstoken
    option.headers.ortegaaccesstoken = '';
    //生成包体
    const data = {
      'CountryCode': 'TW',
      'UserId': 0,
    };
    option.body = data;
    //发包
    let result = await sendRequest(authURL + 'getDataUri', option);
    return result;
  }
  //https://prd1-auth.mememori-boi.com/api/auth/createUser
  async function createUser(AuthToken, AdverisementId, ortegauuid) {
    let option = buildOption();
    const data = {
      'AdverisementId': AdverisementId,
      'AppVersion': AppVersion,
      'CountryCode': CountryCode,
      'DeviceToken': '',
      'DisplayLanguage': 4,
      'ModelName': ModelName,
      'OSVersion': OSVersion,
      'SteamTicket': '',
      'AuthToken': AuthToken,
    };
    option.body = data;
    option.headers.ortegauuid = ortegauuid;
    let result = await sendRequest(authURL + 'createUser', option);
    return result;
  }
  //https://prd1-auth.mememori-boi.com/api/auth/setUserSetting
  async function setUserSetting() {
    let option = buildOption();
    const data = {
      'UserSettingsType': 2,
      'Value': 2,
      'DeviceToken': '',
    };
    option.body = data;
    let result = await sendRequest(authURL + 'setUserSetting', option);
    return result;
  }
  //https://prd1-auth.mememori-boi.com/api/auth/createWorldPlayer
  async function createWorldPlayer() {
    let option = buildOption();
    const data = {
      'WorldId': WorldId,
      'Comment': '侦查员一号',
      'Name': '侦查员一号',
      'DeepLinkId': 0,
      'SteamTicket': null,
    };
    option.body = data;
    let result = await sendRequest(authURL + 'createWorldPlayer', option);
    return result;
  }
  //https://prd1-auth.mememori-boi.com/api/auth/getComebackUserData
  async function getComebackUserData(FromUserId, UserId, Password, AuthToken) {
    let option = buildOption();
    const data = {
      'AppleIdToken': null,
      'FromUserId': new Uint64BE(FromUserId),
      'GoogleAuthorizationCode': null,
      'Password': Password,
      'SnsType': 1,
      'TwitterAccessToken': null,
      'TwitterAccessTokenSecret': null,
      'UserId': new Uint64BE(UserId),
      'AuthToken': AuthToken,
    };
    option.body = data;
    let result = await sendRequest(authURL + 'getComebackUserData', option);
    return result;
  }
  //https://prd1-auth.mememori-boi.com/api/auth/comebackUser
  async function comebackUser(FromUserId, OneTimeToken, UserId) {
    let option = buildOption();
    const data = {
      'FromUserId': new Uint64BE(FromUserId, 10),
      'OneTimeToken': OneTimeToken,
      'ToUserId': new Uint64BE(UserId, 10),
      'SteamTicket': null,
    };
    option.body = data;
    let result = await sendRequest(authURL + 'comebackUser', option);
    return result;
  }
  //https://prd1-auth.mememori-boi.com/api/auth/login
  async function login(ClientKey, AdverisementId, UserId) {
    let option = buildOption();
    const data = {
      'ClientKey': ClientKey,
      'DeviceToken': '',
      'AppVersion': AppVersion,
      'OSVersion': OSVersion,
      'ModelName': ModelName,
      'AdverisementId': AdverisementId,
      'UserId': new Uint64BE(UserId, 10),
      'IsPushNotificationAllowed': false,
    };
    option.body = data;
    let result = await sendRequest(authURL + 'login', option);
    return result;
  }
  //https://prd1-auth.mememori-boi.com/api/auth/getServerHost
  async function getServerHost(WorldId) {
    let option = buildOption();
    const data = {
      'WorldId': WorldId,
    };
    option.body = data;
    let result = await sendRequest(authURL + 'getServerHost', option);
    return result;
  }
  //user/loginPlayer
  async function loginPlayer(PlayerId, Password) {
    let option = buildOption();
    const data = {
      'Password': Password,
      'PlayerId': new Uint64BE(PlayerId, 10),
      'ErrorLogInfoList': null,
      'SteamTicket': null,
    };
    option.body = data;
    let result = await sendRequest(userURL + 'user/loginPlayer', option);
    return result;
  }
  //user/getUserData
  async function getUserData() {
    let option = buildOption();
    const data = {};
    option.body = data;
    let result = await sendRequest(userURL + 'user/getUserData', option);
    return result;
  }
  //localGvg/getLocalGvgSceneTransitionData
  async function getLocalGvgSceneTransitionData() {
    let option = buildOption();
    const data = {};
    option.body = data;
    let result = await sendRequest(userURL + 'localGvg/getLocalGvgSceneTransitionData', option);
    return result;
  }
  //工具函数
  async function sendRequest(url, option = {}) {
    let request = await sendGMRequest(url, option);
    return request;
  }
  //跨域请求函数
  async function sendGMRequest(url, option = {}) {
    return new Promise((resolve) => {
      let method = option.method ? option.method : 'GET';
      let headers = option.headers ? option.headers : {};
      let data;
      let binary = false;
      if (option.body) {
        if (option.msgpack) {
          //每次重新生成uuid
          if (!headers.ortegauuid) {
            headers.ortegauuid = crypto.randomUUID().replaceAll('-', '');
          }
          if (!headers.ortegaaccesstoken) {
            headers.ortegaaccesstoken = getStorage('ortegaaccesstoken');
          }
          data = new Blob([msgpack.encode(option.body)]);
          binary = true;
        } else {
          data = option.body;
        }
      }
      let responseType = option.type ? option.type : null;
      GM_xmlhttpRequest({
        method: method,
        url: url,
        headers: headers,
        data: data,
        responseType: responseType,
        onload: async (response) => {
          if (response.readyState == 4) {
            let type = getHeader(response.responseHeaders, 'content-type');
            let data;
            if (type == 'application/octet-stream') {
              let token = getHeader(response.responseHeaders, 'orteganextaccesstoken');
              if (token != undefined && token != '' && token != null) {
                setStorage('ortegaaccesstoken', token);
              }
              setStorage('AssetVersion', getHeader(response.responseHeaders, 'ortegamasterversion'));
              setStorage('MasterVersion', getHeader(response.responseHeaders, 'ortegamasterversion'));
              setStorage('utcnowtimestamp', getHeader(response.responseHeaders, 'ortegautcnowtimestamp'));
              data = await msgpack.decode(new Uint8Array(response.response));
              if (data.ErrorCode) {
                const ErrorCode = JSON.parse(getStorage('ErrorCode'));
                console.log(`${response.finalUrl.split('/').pop()}:${ErrorCode[data.ErrorCode]}`);
              } else {
                console.log(`${response.finalUrl.split('/').pop()}:获取成功`);
              }
            } else {
              data = response.response;
            }
            resolve(data);
          }
        },
        onerror: function () {
          console.log('Request failed');
        },
      });
      //*/
    });
  }
  async function sendXMLRequest(url, option = {}) {
    return new Promise((resolve) => {
      let method = option.method ? option.method : 'GET';
      let headers = option.headers ? option.headers : {};
      let data;
      if (option.body) {
        if (option.msgpack) {
          //每次重新生成uuid
          if (!headers.ortegauuid) {
            headers.ortegauuid = crypto.randomUUID().replaceAll('-', '');
          }
          headers.ortegaaccesstoken = getStorage('ortegaaccesstoken');
          data = msgpack.encode(option.body);
        } else {
          data = option.body;
        }
      }
      let responseType = option.type ? option.type : null;
      let request = new XMLHttpRequest();
      request.open(method, url);
      request.responseType = responseType;
      for (let i in headers) {
        request.setRequestHeader(i, headers[i]);
      }
      request.send(data);
      request.onload = async function () {
        if (request.status != 200) {
          // 分析响应的 HTTP 状态
          console.log(`Error ${request.status}: ${request.statusText}`); // 例如 404: Not Found
        } else {
          // 显示结果
          const response = request.response;
          console.log(`Done, got ${response.length} bytes`); // response 是服务器响应
          const type = request.getResponseHeader('content-type');
          setStorage('ortegaaccesstoken', request.getResponseHeader('orteganextaccesstoken'));
          setStorage('AssetVersion', request.getResponseHeader('assetversion'));
          setStorage('MasterVersion', request.getResponseHeader('masterversion'));
          setStorage('utcnowtimestamp', request.getResponseHeader('utcnowtimestamp'));
          let data;
          if (type == 'application/octet-stream') {
            data = await msgpack.decode(new Uint8Array(response));
            if (data.ErrorCode) {
              const ErrorCode = JSON.parse(getStorage('ErrorCode'));
              console.log(`${request.responseURL.split('/').pop()}:${ErrorCode[data.ErrorCode]}`);
            } else {
              console.log(`${request.responseURL.split('/').pop()}:获取成功`);
            }
          } else {
            data = response;
          }
          resolve(data);
        }
        request.onprogress = function (event) {
          if (event.lengthComputable) {
            console.log(`Received ${event.loaded} of ${event.total} bytes`);
          } else {
            console.log(`Received ${event.loaded} bytes`); // 没有 Content-Length
          }
        };
        request.onerror = function () {
          console.log('Request failed');
        };
      };
    });
  }
  //改变颜色
  function changeNode() {
    let showMiddle = document.getElementById('showMiddle').checked;
    let radioList = document.querySelectorAll('[type="radio"]');
    let guildList = {
      enermy: [],
      friend: [],
      middle: [],
    };
    for (let i = 0; i < radioList.length; i++) {
      if (radioList[i].checked == true) {
        guildList[radioList[i].value].push(radioList[i].name);
      }
    }
    let playerList = document.getElementsByClassName('nodePlayer');
    for (let i = 0; i < playerList.length; i++) {
      let player = playerList[i];
      let playerGuild = player.getAttribute('guild');
      let indexFriendGuild = guildList.friend.indexOf(playerGuild);
      let indexEnermyGuild = guildList.enermy.indexOf(playerGuild);
      if (indexFriendGuild > -1) {
        player.setAttribute('relation', 'friend' + indexFriendGuild);
      } else if (indexEnermyGuild > -1) {
        player.setAttribute('relation', 'enermy' + indexEnermyGuild);
      } else {
        if (showMiddle) {
          player.setAttribute('relation', 'middle');
        } else {
          player.setAttribute('relation', 'none');
        }
      }
    }
  }
  //新建DOM
  function createElement(type, text = '') {
    let node;
    if (type == 'text') {
      node = document.createTextNode(text);
    } else {
      node = document.createElement(type);
      node.innerHTML = text;
    }
    return node;
  }
  //获取消息头
  function getHeader(headers, key) {
    let reg = new RegExp(`${key}:( ?)(?<token>.*?)\\r\\n`, 'i');
    let match = reg.exec(headers);
    let result;
    if (match) {
      result = match.groups.token;
    }
    return result;
  }
  //获取代码定义
  function getVariable(script, variable) {
    let reg = new RegExp(`${variable} *?= *('|"|\`)?(?<value>.*?)('|"|\`)? *(;)?(\\n|\\r)`);
    let match = reg.exec(script);
    if (match) {
      return match.groups.value;
    }
  }
  //获取存储对象
  function getStorage(key) {
    return localStorage.getItem(key);
  }
  //设置存储对象
  function setStorage(key, value) {
    localStorage.removeItem(key);
    if (value != null && value != undefined) {
      localStorage.setItem(key, value);
    }
    return value;
  }
})();
