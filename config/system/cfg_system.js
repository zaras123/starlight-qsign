export const cfgSchema = {
    starlight_qsign: {
      title: '功能设置',
      cfg: {
        signlist: {
          title: '公共签名列表',
          key: '公共签名列表',
          def: true,
          desc: '是否开启签名列表',
          fileName: 'sign'
        },      
        concurrent_limit: {
            title: '并发限制',
            key: '并发限制',
            type: 'num',
            def: 0,
            input: (n) => Math.min(10, Math.max(0, (n * 1 || 100))),
            desc: '公共签名列表并发处理: 0-不限制，最多10，设置大点会提高公共签名列表生成速度',
            fileName: 'sign'
          },      
          renderScale: {
            title: '渲染精度',
            key: '渲染精度',
            type: 'num',
            def: 100,
            input: (n) => Math.min(200, Math.max(50, (n * 1 || 100))),
            desc: '可选值50~200，建议100。设置高精度会提高图片的精细度，但因图片较大可能会影响渲染与发送速度',
            fileName: 'config'
          },
          state: {
            title: '签名统计',
            key: '签名统计',
            def: false,
            desc: '是否开启签名统计',
            fileName: 'state'
          }
      }
    }
  }
  