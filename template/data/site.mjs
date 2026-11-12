// 唯一事实来源：品牌、联系方式、地址、服务区域、域名。
// 规则：这些值只允许出现在本文件。页面、SEO metadata、JSON-LD、页脚全部从这里取。
export const site = {
  // 基本信息
  name: "示例品牌",
  legalName: "示例品牌（太原）有限公司",
  title: "示例品牌｜太原本地全屋定制服务",
  description:
    "这里是可直接回答“你是谁、服务哪里、做什么”的一句话摘要，同时用于首屏文案与 SEO 描述。",
  orgType: "Organization", // 有实体门店且资料齐全时可改 HomeAndConstructionBusiness

  // 站点
  url: "https://example.com", // 换成正式域名，结尾不要带斜杠
  locale: "zh_CN",
  ogImage: "/og.png", // 1200×630
  logo: "/logo.png",

  // 联系方式（页面、页脚、JSON-LD 共用同一份）
  phone: "13800000000",
  address: {
    street: "示例路 1 号",
    locality: "太原市",
    region: "山西省",
    country: "CN",
  },
  areaServed: ["小店区", "迎泽区", "杏花岭区"],

  // 合规信息：拿到正式备案号之前保持空字符串，页面会自动隐藏整行
  icp: "",
};
