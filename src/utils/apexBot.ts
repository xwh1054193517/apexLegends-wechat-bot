import moment from "moment";
import { FileBox } from "file-box";
import request from "./request.ts";
import { mapCnName } from "./enums.ts";

function formatTime(time) {
  if (!time) return "";
  return moment(Number(time) * 1000).format("YYYY-MM-DD HH:mm:ss");
}
class ApexBot {
  private static instance: ApexBot;
  maxRequestLen: number;
  requestPromise: Array<any>;
  static getInstance(): ApexBot {
    if (!ApexBot.instance) this.instance = new ApexBot();
    else return this.instance;
  }

  constructor() {
    this.requestPromise = [];
    this.maxRequestLen = 2;
  }

  serializeParamsWithUrl(url: string, param: any) {
    if (!(typeof param === "object")) return url;

    let finalUrl = url;

    let objUrl = "";
    for (const k in param) {
      const value = param[k] !== undefined ? param[k] : "";
      objUrl += `&${k}=${value}`;
    }
    objUrl = objUrl ? `?${objUrl.substring(1)}` : "";
    finalUrl = url += objUrl;
    return finalUrl;
  }

  // 处理请求
  async dealRequset(url: string, param?: any) {
    if (this.requestPromise.length < this.maxRequestLen)
      this.requestPromise.push(url);
    else throw new Error("每秒只能请求2个");
    console.warn(
      `请求${this.serializeParamsWithUrl(url, param)},参数为:${JSON.stringify(
        param
      )}`
    );
    const res = await request(this.serializeParamsWithUrl(url, param));
    this.requestPromise.splice(
      this.requestPromise.findIndex((item) => item === url),
      1
    );

    // console.warn('结果为:')
    // console.warn(res)
    return res;
  }

  // 根据玩家名查询
  async queryPlayerByName(player: string, platForm?: string) {
    if (player) {
      try {
        const platform = platForm || "PC";
        const res: any = await this.dealRequset("/bridge", {
          player,
          platform,
        });
        const { global, realtime } = res;
        const { rank } = global;
        console.warn(res);
        const content = `玩家:${global.name}\nuid:${global.uid}\n平台:${
          global.platform
        }\n等级:${global.level}\n段位:${rank.rankName}${rank.rankDiv}\n分数:${
          rank.rankScore
        }\n当前状态:${realtime.currentState}\n当前选择英雄:${
          realtime.currentState !== "offline" ? realtime.selectedLegend : "-"
        }`;
        return content;
      } catch (error) {
        return JSON.stringify(error);
      }
    } else {
      return "请输入玩家名字 格式为 查询玩家 玩家名";
    }
  }

  // 根据玩家uid查询
  async queryPlayerByUID(player: string, platForm?: string) {
    if (player) {
      try {
        const platform = platForm || "PC";
        const res: any = await this.dealRequset("/bridge", {
          player,
          platform,
        });
        const { global, realtime } = res;
        const { rank } = global;
        const content = `玩家:${global.name}\nuid:${global.uid}\n平台:${
          global.platform
        }\n等级:${global.level}\n段位:${rank.rankName}${rank.rankDiv}\n分数:${
          rank.rankScore
        }\n当前状态:${realtime.currentState}\n当前选择英雄:${
          realtime.currentState !== "offline" ? realtime.selectedLegend : "-"
        }`;
        console.warn(content);
        return content;
      } catch (error) {
        return JSON.stringify(error);
      }
    } else {
      return "请输入玩家uid 格式为 查询玩家id uid";
    }
  }

  // 查询地图
  async queryMap() {
    try {
      const res: any = await this.dealRequset("/maprotation?version=2", {});
      const { battle_royale, ranked } = res;
      const { current: currentBr, next: nextBr } = battle_royale;
      const { current: currentRk, next: nextRk } = ranked;
      const content = `当前匹配地图:${
        mapCnName[currentBr.map]
      }\n地图持续时间:${formatTime(currentBr.start)} - ${formatTime(
        currentBr.end
      )}\n即将轮换地图:${mapCnName[nextBr.map]}\n地图持续时间:${formatTime(
        nextBr.start
      )} - ${formatTime(nextBr.end)}\n\n当前排位地图:${
        mapCnName[currentRk.map]
      }\n地图持续时间:地图持续时间:${formatTime(
        currentRk.start
      )} - ${formatTime(currentRk.end)}\n明日排位地图:${
        mapCnName[nextRk.map]
      }\n地图持续时间:地图持续时间:${formatTime(nextRk.start)} - ${formatTime(
        nextRk.end
      )}`;
      console.warn(content);
      return content;
    } catch (error) {
      return JSON.stringify(error);
    }
  }

  // 查询服务器
  async queryServerStatus() {
    try {
      const res: any = await this.dealRequset("/servers", {});
      console.warn(res);
    } catch (error) {
      return JSON.stringify(error);
    }
  }

  // 查询猎杀分数
  async queryPredator() {
    try {
      const res: any = await this.dealRequset("/predator", {});
      const { RP } = res;
      const pointObj = [];

      Object.keys(RP).forEach((key) => {
        if (RP[key].foundRank !== -1) {
          const contentItem = `${key}端\n猎杀底分：${
            RP[key].val
          }\n更新时间：${moment(Number(RP[key].updateTimestamp) * 1000).format(
            "YYYY-MM-DD HH:mm:ss"
          )}\n大师猎杀总人数：${RP[key].totalMastersAndPreds}`;
          pointObj.push(contentItem);
        }
      });
      const finalContent = pointObj.join("\n\n");
      return finalContent;
    } catch (error) {
      return JSON.stringify(error);
    }
  }

  // 查询商店
  async queryStore() {
    try {
      const res: any = await this.dealRequset("/store", {});
      const fileBoxArr = [];
      res.forEach((item: any) => {
        const file = FileBox.fromUrl(item.asset);
        console.warn(file);
      });

      // console.warn(res)
      console.warn(fileBoxArr);
    } catch (error) {
      return JSON.stringify(error);
    }
  }

  // 根据名字查UID
  async queryUidByName(player: string, platForm?: string) {
    if (player) {
      try {
        const platform = platForm || "PC";
        const res: any = await this.dealRequset("/nametouid", {
          player,
          platform,
        });
        const content = `查询玩家:${player}\n玩家UID:${res.uid || "-"}`;
        return content;
      } catch (error) {
        return JSON.stringify(error);
      }
    } else {
      return "请输入玩家姓名 格式为 查询玩家uid 玩家名称";
    }
  }
}
export default ApexBot;
