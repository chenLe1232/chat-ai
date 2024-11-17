import {
  _decorator,
  assetManager,
  AudioClip,
  AudioSource,
  Button,
  Component,
  LabelComponent,
  Node,
} from "cc";
import { get, post, request } from "./ai/chat";
import { ChatRes } from "./ai/interface/chat";
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
  //! click start 启动一次 后续点击不生效
  clickStart = false;
  //! 最大会话次数
  maxSession = 5;
  //! 狗子对话次数
  dogSession = 0;
  //! 猫咪对话次数
  catSession = 0;
  //! 是否正在对话中
  private isInConversation = false;

  // 播放音频的通用方法
  private playAudio(audioURL: string, onEnd?: () => Promise<void>) {
    if (!audioURL) return;

    assetManager.loadRemote(audioURL, (err, clip: AudioClip) => {
      if (err) {
        console.error("Failed to load audio:", err);
        return;
      }
      //! TODO: 这种每次增加节点方式不太好
      const audioSource =
        this.node.getComponent(AudioSource) ||
        this.node.addComponent(AudioSource);

      // 移除之前的事件监听
      audioSource.node.off(AudioSource.EventType.ENDED);

      // 添加新的事件监听
      audioSource.node.on(
        AudioSource.EventType.ENDED,
        async () => {
          //! 有一个 bug 最后一轮对话 文案展示了 但是语音没有展示出来
          if (onEnd && !this.isInConversation) {
            this.isInConversation = true;
            await onEnd();
            this.isInConversation = false;
          }
        },
        this
      );

      audioSource.clip = clip;
      audioSource.play();
    });
  }

  onLoad() {
    //! 注册事件
    //! TODO debounce
    this.startBtn.node.on("click", this.onClickStart, this);
    this.endBtn.node.on("click", this.onClickEnd, this);
  }
  //! 点击开始按钮
  onClickStart() {
    if (this.clickStart) return;
    this.clickStart = true;
    //! 播放音乐
    this.getEmotion({});
  }
  //! 点击结束按钮
  onClickEnd() {}
  showDogBubble(labelTxt: string, url?: string) {
    //! 设置狗子气泡文字 并且 展示 狗子 sprite
    this.dogLabel.string = labelTxt;
    this.dogSprite.active = true;
    this.catSprite.active = false;
    if (this.catSession < this.maxSession) {
      this.playAudio(url, async () => await this.getCatEmotion(labelTxt));
    }
  }
  showCatBubble(labelTxt: string, url?: string) {
    this.catLabel.string = labelTxt;
    this.catSprite.active = true;
    this.dogSprite.active = false;
    if (this.dogSession < this.maxSession) {
      this.playAudio(url, async () => await this.getDogEmotion(labelTxt));
    }
  }
  async getDogEmotion(msg = "") {
    if (this.dogSession >= this.maxSession) return;
    this.dogSession++;
    await this.getEmotion({
      msg,
    });
  }
  async getCatEmotion(msg = "") {
    if (this.catSession >= this.maxSession) return;
    this.catSession++;
    await this.getEmotion({
      msg,
      type: "cat",
    });
  }
  //！ 获取情感对话
  async getEmotion({
    msg = "我好难受宝贝，今天在加班，好想你",
    prompt = "",
    type = "dog",
  }) {
    console.time("getEmotion");
    const res = await post<ChatRes>("http://localhost:3000/normalChat", {
      msg,
      role: type === "dog" ? "man" : "cat",
    });
    console.timeEnd("getEmotion");
    if (res.msg) {
      console.time("showDogBubble");
      console.log(res.msg);
      if (type === "dog") {
        this.showDogBubble(res.msg, res.audioPath);
      } else {
        this.showCatBubble(res.msg, res.audioPath);
      }
      console.timeEnd("showDogBubble");
    }
  }
  onAudioEnded() {
    console.log("%c 音频播放结束", "color: red");
  }
  start() {
    // Your initialization goes here
  }

  update(deltaTime: number) {
    // Your update function goes here
  }
}
