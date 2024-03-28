import common from '../../../lib/common/common.js';
import { Config } from '../components/index.js';
import axios from 'axios';

export class index extends plugin {
  constructor() {
    super({
      name: '星点签名插件',
      event: 'message',
      priority: -33699,
      rule: [
        {
          reg:  /^(#)?(公共(api)?(签名)?(api)?|api(列表|签名)|45)$/i,
          fnc: 'list',
        }
      ],
    });
  }

  async list(e) {
    if (!Config.signlist) return false

    await e.reply('正在从云端获取公共签名API列表信息,请稍候...', true);

    let concurrentLimit = 0;
    concurrentLimit = Config.concurrent_limit || 0;

    const urls = [
        { name: 'GitHub', url: 'https://github.com/wuliya336/starlight-qsign/raw/api/signlist.json' },
        { name: 'Gitee', url: 'https://gitee.com/wuliya336/starlight-qsign/raw/api/signlist.json' }
    ];

    let rawData;
    let success = false;

    const responses = await Promise.all(urls.map(async ({ name, url }) => {
      try {
          const response = await axios.get(url);
          return { name, data: response.data };
      } catch (error) {
          return { name, error };
      }
  }));

  const successfulResponse = responses.find(({ error }) => !error);
  const { name, data } = successfulResponse || responses[0];

  if (successfulResponse) {
      rawData = data;
      success = true;
  } else {
      await e.reply('获取公共签名API列表云端信息失败，请稍后重试');
      return false;
  }

    const providers = rawData;
    const userAgent = 'starlight-qsign';
    let msg = ['公共签名API列表'];

    for (const [provider, providerInfo] of Object.entries(providers)) {
      msg.push(`由 ${provider} 提供:`);
      let providerMsgs = [];
      let tasks = providerInfo.flatMap(info =>
          Object.entries(info).map(([key, url]) => {
              if (key === 'memo') {
                msg.push(`备注: ${info.memo}`);
                return;
              }
              return (async () => {
                  const start = Date.now();
                  try {
                      const response = await axios.get(url, { headers: { 'User-Agent': userAgent } });
                      const status = response.status === 200 ? '✅ 正常' : '❎ 异常';
                      const delay = `${Date.now() - start}ms`;
                      return `${key}: ${status} ${delay}\n${url}`;
                  } catch (error) {
                      return `${key}: ❎ 异常 timeout\n${url}`;
                  }
              })();
          })
      );

      let results = [];
      if (concurrentLimit > 0) {
          for (let i = 0; i < tasks.length; i += concurrentLimit) {
              const batch = tasks.slice(i, i + concurrentLimit);
              results.push(...(await Promise.all(batch)));
          }
      } else {
          results = await Promise.all(tasks);
      }

      providerMsgs.push(results.join('\n'));
      msg.push(providerMsgs);
  }

  await e.reply(common.makeForwardMsg(e, msg, `点击查看公共签名API列表`));
  return true;
}
}