(function () {
    'use strict';

    class choose extends Laya.Script {

        constructor() { 
            super(); 
            /** @prop {name:next,tips:"场景切换",type:Prefab}*/
        }


        onEnable() {
            this.owner.on(Laya.Event.CLICK,this,this.toScene);
        }

        toScene(){       //判断点击哪个跳转哪个场景
            let  t = this.owner.parent.getChildIndex(this.owner)+1;
            let next = Laya.Pool.getItemByCreateFun("next", this.next.create, this.next);
            let text = next.getChildByName('text');
            text.changeText(`第   ${t}   关`);
            Laya.Scene.closeAll();
            Laya.stage.addChild(next);
            Laya.timer.once(3000,this,change);   
            function change(){
                Laya.Scene.open('round' + t +'.scene');
                next.removeSelf();   
            }
        }

    }

    class gameover extends Laya.Script {

        constructor() { 
            super(); 

        }
        
        onEnable() {
            this.back = this.owner.getChildByName('close');
            this.back.on(Laya.Event.CLICK,this,this.toChoose);  //跳转选择界面
        }

        toChoose(){
            Laya.Scene.open('choose.scene');
        }

     
    }

    class drawlineDanbai extends Laya.Script {

        constructor() { 
            super(); 
        }
        
        onAwake() {
            this.danbai1 = this.owner.getChildByName('danbai1');//画线
            this.line1 = new Laya.Sprite();
            this.owner.addChild(this.line1);
        }


        draw(){
            this.line1.graphics.clear();
            this.line1.graphics.drawLine(228, 46, this.danbai1.x,this.danbai1.y, "#ff0000",1);
        }

        onUpdate(){
            this.draw();
        }
    }

    class pingyi extends Laya.Script {

        constructor() { 
            super(); 
        }
        
        onEnable() {
            this.index0 = this.owner.getChildAt(0);
            this.index1 = this.owner.getChildAt(1);
            this.right = true;
        }
        


        onUpdate(){
          if(this.index0.x > 100 || this.index0.x < 0 ){   //左右平移判断
            this.right = ! this.right;
          }
          if(this.right){
            this.index0.x++;
            this.index1.x--;
          }else{
            this.index0.x--;
            this.index1.x++;
          }
        }
    }

    class laya extends Laya.Script {

        constructor() { 
            super(); 
        }
        
        onEnable() {
            this.hualun1 = this.owner.getChildByName('hualun1');
            this.hualun2 = this.owner.getChildByName('hualun2');
            this.line1 = new Laya.Sprite(),
            this.line2 = new Laya.Sprite(),
            this.owner.addChild(this.line1);
            this.owner.addChild(this.line2);
           
        }



        draw(){
            this.line1.graphics.clear();
            this.line1.graphics.drawLine(50, 40, 50,this.hualun1.y, "#ff0000",1);
            this.line2.graphics.clear();
            this.line2.graphics.drawLine(220, 40, 220,this.hualun2.y, "#ff0000",1);
        }

        onUpdate(){
           this.draw();
        }
    }

    class hong extends Laya.Script {

        constructor() {
            super();
            /** @prop {name:life, tips:"life", type:Number, default:3}*/
            /** @prop {name:distanceX, tips:"distanceX", type:Number, default:200}*/
            box2d.DEBUG = false;
        }


        //初始化参数
        onEnable() {
            this.box = this.owner.getComponent(Laya.BoxCollider);
            this.arr = [3, 4, 5, 6, 7, 8, 9, 10];
            this.pageIndex = 0;
            this.jump = false;    //跳跃能力   
            this.LF_RUn = true;
            Laya.Physics.I.worldRoot = this.owner.parent; //  物理世界 = 场景
            //this.owner.x = 5000
            this.win = false;
            hong.instance = this;  // 小红实例
        }


        //碰撞产生
        onTriggerEnter(other, self, contact) {
            var owner = this.owner;
            //判断碰到何种物体
            if (other.label === 'taban') {
                other.rigidBody.type = 'dynamic';
            }
            if (other.label === 'ci') {      //游戏失败  播放死亡动画
                Laya.SoundManager.stopMusic('sound/round1.mp3');
                Laya.SoundManager.playSound("sound/die.mp3");
                let effect = Laya.Pool.getItemByCreateFun("effect", this.createDie, this);
                effect.pos(owner.x, owner.y);
                owner.parent.addChild(effect);
                effect.play(0, false);
                owner.removeSelf();
            }
            if (other.label === 'bing') {   //冰地面
                this.bing = true;
            }
            if (other.label === 'tizi') {   //爬梯
                this.pa = true;
            }
            if (other.label == 'lan') {  //游戏胜利  播放离场动画
                var _this = this;
                let effect2 = Laya.Pool.getItemByCreateFun("effect2", this.createWin, this);
                effect2.pos(7030, 681);
                owner.parent.addChild(effect2);
                effect2.play(0, true);
                Laya.timer.frameLoop(1, null, Xchange);
                function Xchange() {
                    if (effect2.x < 7250) {
                        effect2.x++;
                    } else {
                        _this.win = true;
                        Laya.timer.clearAll(this);
                    }
                }
                owner.removeSelf();
                other.owner.removeSelf();
            }
            if (self.owner.localToGlobal({ x: 0, y: (self.height - 5) }, true).y < other.owner.localToGlobal(other, true).y) {  // 判断能否继续跳跃
                this.jump = true;
            } // 判断跳跃
        }

        //通关动画
        createWin() {
            let win = new Laya.Animation();
            win.source = 'ani/win.ani';
            win.interval = 100;
            return win;
        }


        //死亡动画
        createDie() {
            let ani = new Laya.Animation();
            ani.source = 'ani/siwang.ani';
            ani.interval = 300;
            var t = 1;
            ani.on(Laya.Event.COMPLETE, null, recover);
            function recover() {
                var time = Laya.timer.loop(1, this, change);
                function change() {
                    if (t < 5) {
                        t++;
                    }
                    ani.y += t;
                    if (ani.y >= Laya.stage.height) {
                        t = 1;
                        Laya.Scene.open('gameover.scene');
                        Laya.timer.clearAll(this);
                        Laya.Pool.recover("effect", ani);
                    }
                }
            }
            return ani;
        }



        //碰撞脱离   
        onTriggerExit(other, self, contact) {
            if (other.label == 'bing') {
                this.bing = false;
            }
            if (other.label == 'tizi') {
                this.pa = false;
            }
            this.jump = false;
        }


        //键盘按下
        onKeyDown(e) {
            var rig = this.owner.getComponent(Laya.RigidBody);
            switch (e.keyCode) {
                case 37:
                    this.left = true;
                    if (this.bing) {
                        rig.setVelocity({ x: -8, y: 0 });
                        Laya.KeyBoardManager.enabled = false;
                    }
                    break;
                case 39:
                    this.right = true;
                    if (this.bing) {
                        rig.setVelocity({ x: 8, y: 0 });
                        Laya.KeyBoardManager.enabled = false;
                    }
                    break;
                case 38:
                    if (this.pa) {
                        this.owner.texture = 'Round2/hong/pa_13.png';
                        this.owner.y -= 5;
                        rig.gravityScale = 0;
                    }
                    if (this.jump && !this.pa) {
                        Laya.SoundManager.playSound("sound/jump.mp3");
                        rig.setVelocity({ x: 0, y: -8 });
                    }
                    this.jump = false;
                    break;
                case 40:
                    if (this.pa) {
                        this.owner.y += 5;
                    } else {
                        this.box.width = 40;
                        this.box.height = 20;
                        this.box.y = 20;
                    }
                    break;
            }
        }


        //键盘抬起
        onKeyUp(e) {
            switch (e.keyCode) {
                case 37:
                    this.left = false;
                    this.owner.texture = 'Round2/hong/hongleft_10.png';
                    this.pageIndex = 0;
                    break;
                case 39:
                    this.right = false;
                    this.owner.texture = 'Round2/hong/hong_03.png';
                    this.pageIndex = 0;
                    break;
                case 40:
                    this.box.width = 20;
                    this.box.height = 40;
                    this.box.y = 0;
                    break;
            }
        }

        //每帧刷新
        onUpdate() {
            if (this.right) {  // 右走
                this.pageIndex = ++this.pageIndex >= 7 ? 0 : this.pageIndex;
                this.owner.texture = 'Round2/hong/hong_0' + this.arr[this.pageIndex] + '.png';
                if (this.owner.x < this.owner.parent.width - 50) {
                    this.owner.x += 5;
                }
            }
            if (this.left) {   //左走
                this.pageIndex = ++this.pageIndex >= 7 ? 0 : this.pageIndex;
                this.owner.texture = 'Round2/hong/hongleft_0' + this.arr[this.pageIndex] + '.png';
                if (this.owner.x > 0) {
                    this.owner.x -= 5;
                }
            }
            if (this.owner.x > 400 && this.owner.x < this.owner.parent.width - 600) {  //场景跟随人物移动而移动
                this.owner.parent.x = -(this.owner.x - 400);
            }
            if (this.owner.y > Laya.stage.height) {  // 人物脱离舞台 
                this.owner.removeSelf();
                Laya.SoundManager.stopMusic("sound/round1.mp3");
                Laya.Scene.open('gameover.scene');
            }
        }
    }

    class round1 extends Laya.Script {

        constructor() {
            super();
            /** @prop {name:next,tips:"场景切换",type:Prefab}*/
        }

        onEnable() {
            Laya.SoundManager.playMusic("sound/round1.mp3");
            Laya.KeyBoardManager.enabled = true;
        }

        onUpdate() {
            if (hong.instance.win) {         //如果胜利切换场景
                Laya.SoundManager.stopMusic("sound/round1.mp3");
                let t = ++this.owner.name;
                let next = Laya.Pool.getItemByCreateFun("next", this.next.create, this.next);
                let text = next.getChildByName('text');
                text.changeText(`第   ${t}   关`);
                Laya.Scene.closeAll();
                Laya.stage.addChild(next);
                Laya.timer.once(3000, this, change);
                function change() {
                    Laya.Scene.open('round' + t + '.scene');
                    next.removeSelf();
                }
            }
        }
    }

    //import haixiu from "./haixiu";
        class round2 extends Laya.Script {

        constructor() { 
            super(); 
            /** @prop {name:haixiu,tips:"精灵预制体对象",type:Prefab}*/
        }
        
        onEnable() {
            Laya.KeyBoardManager.enabled = true;
            this.createInterval = 1000;
            this._time = Date.now();
            this.Box = this.owner.getChildByName("Box");
            Laya.timer.frameLoop(2,this,this.changey);
        }

        changey(){
            this.owner.y++;
        }

        onUpdate(){
            let now = Date.now();
            if (now - this._time > this.createBoxInterval) {
                this._time = now;
            }
        }


        create() {
            //使用对象池创建精灵
            let haixiu = Laya.Pool.getItemByCreateFun("haixiu", this.haixiu.create, this.haixiu);
            haixiu.pos(Math.random() * (Laya.stage.width - 100), 100);
            this.Box.addChild(haixiu);
        }

    }

    class start extends Laya.Script {

        constructor() { 
            super(); 
           
        }
        
        onEnable() {
            this.start = this.owner.getChildByName('start');
            this.exit  = this.owner.getChildByName('exit');
            this.start.on(Laya.Event.CLICK, this, this.onstartclick);
            this.exit.on(Laya.Event.CLICK, this, this.onexitclick);
            Laya.UIConfig.closeDialogOnSide = false;
            this.createTween();
        }

        onstartclick(){
            Laya.Scene.open('choose.scene');
        }

        onexitclick(){
            Laya.Scene.closeAll();
        }

        //Running 文本
        createTween(){
            //"LayaBox"字符串总宽度
            var w = 400;
            //文本创建的起始x位置(>>在此使用右移运算符，相当于/2 用>>效率更高)
            var offsetX = Laya.stage.width - w >> 1;
            //显示的字符串
            var demoString = "Running";
            var letterText;
            for(var i = 0,len = demoString.length;i<len;++i){
                //从"LayaBox"字符串中逐个提出单个字符创建文本
                letterText = this.createLetter(demoString.charAt(i));
                letterText.x = w/len*i+offsetX;
                //文本的初始y属性
                letterText.y = 50;
                Laya.Tween.to(letterText,{y:200,update:new Laya.Handler(this,this.updateColor,
                    [letterText])},1000,Laya.Ease.bounceIn,Laya.Handler.create
                (this,this.changeColor,[letterText]),i*100);
            }
        }

        updateColor(txt){
            var c = Math.floor(Math.random()*3);
            switch (c) {
                case 0:
                    txt.color = "#eee000";
                    break;
                case 1:
                    txt.color = "#ffffff";
                    break;
                case 2:
                    txt.color = "#ff0000";
                    break;
                default:
                    txt.color = "#eee000";
                    break;
            }
        }
     
        changeColor(txt){
            //将文本字体改变成红色
            txt.color = "#ff0000";
        }
        //创建单个字符文本，并加载到舞台
        createLetter(char){
            var letter = new Laya.Text();
            letter.text = char;
            letter.color = "#ffffff";
            letter.font = "Impact";
            letter.fontSize = 50 ;
            this.owner.addChild(letter);
            return letter;
        }

    }

    /**This class is automatically generated by LayaAirIDE, please do not make any modifications. */

    class GameConfig {
        static init() {
            //注册Script或者Runtime引用
            let reg = Laya.ClassUtils.regClass;
    		reg("script/choose.js",choose);
    		reg("script/gameover.js",gameover);
    		reg("script/drawlineDanbai.js",drawlineDanbai);
    		reg("script/pingyi.js",pingyi);
    		reg("script/drawline.js",laya);
    		reg("script/hong.js",hong);
    		reg("script/round1.js",round1);
    		reg("script/round2.js",round2);
    		reg("script/start.js",start);
        }
    }
    GameConfig.width = 1000;
    GameConfig.height = 800;
    GameConfig.scaleMode ="noscale";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "center";
    GameConfig.startScene = "scene/start.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = true;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;

    GameConfig.init();

    class Main {
    	constructor() {
    		//根据IDE设置初始化引擎		
    		if (window["Laya3D"]) Laya3D.init(GameConfig.width, GameConfig.height);
    		else Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
    		Laya["Physics"] && Laya["Physics"].enable();
    		Laya["DebugPanel"] && Laya["DebugPanel"].enable();
    		Laya.stage.scaleMode = GameConfig.scaleMode;
    		Laya.stage.screenMode = GameConfig.screenMode;
    		Laya.stage.alignV = GameConfig.alignV;
    		Laya.stage.alignH = GameConfig.alignH;
    		//兼容微信不支持加载scene后缀场景
    		Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;

    		//打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
    		if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
    		if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
    		if (GameConfig.stat) Laya.Stat.show();
    		Laya.alertGlobalError = true;

    		//激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
    		Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
    	}

    	onVersionLoaded() {
    		//激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
    		Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
    	}

    	onConfigLoaded() {
    		//加载IDE指定的场景
    		GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
    	}
    }
    //激活启动类
    new Main();

}());
