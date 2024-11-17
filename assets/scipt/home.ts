import {
  _decorator,
  assetManager,
  AudioClip,
  AudioSource,
  Button,
  Component,
  LabelAtlas,
  LabelComponent,
  loader,
  Node,
  SpriteComponent,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("Home")
export class Home extends Component {
  /* class member variables */
  //! 狗子气泡文字按钮
  @property(LabelComponent)
  catLabel: LabelComponent = null;

  @property(LabelComponent)
  dogLabel: LabelComponent = null;

  @property(Node)
  catSprite: Node = null;
  @property(Node)
  dogSprite: Node = null;
  @property(Button)
  startBtn: Button = null;
  @property(Button)
  endBtn: Button = null;
  //   @property(AudioSource)
  //   audio: AudioSource = null!;

  onLoad() {
    //! 注册事件
    //! TODO debounce
    this.startBtn.node.on("click", this.onClickStart, this);
    this.endBtn.node.on("click", this.onClickEnd, this);
  }
  //! 点击开始按钮
  onClickStart() {
    //! 设置狗子气泡文字 并且 展示 狗子 sprite
    this.dogLabel.string = "狗";
    this.dogSprite.active = true;
    this.catSprite.active = false;
    //! 播放音乐
    const audioURL = "http://localhost:3000/xiaogao.mp3";
    assetManager.loadRemote(
      audioURL,

      (err, clip: AudioClip) => {
        console.log("clip", clip instanceof AudioClip, clip);
        console.log("err", err);
        //！
        this.node.addComponent(AudioSource).clip = clip;
        this.node.getComponent(AudioSource).play();
      }
    );
  }
  //! 点击结束按钮
  onClickEnd() {
    this.catLabel.string = "猫";
    this.catSprite.active = true;
    this.dogSprite.active = false;
  }

  start() {
    // Your initialization goes here
  }

  update(deltaTime: number) {
    // Your update function goes here
  }
}
