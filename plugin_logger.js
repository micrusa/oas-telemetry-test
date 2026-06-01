const pluginName = "test plugin - log events";

class TestPlugin {
  static name = "";
  static configured = false;
  static load(config = {}) {
    TestPlugin.name = pluginName;
    console.log(
      `Configuring plugin <${TestPlugin.name}> with config: \n${JSON.stringify(config, null, 2)}...`,
    );
    TestPlugin.configured = true;
  }
  static unload() {
    console.log(`Unloading plugin <${TestPlugin.name}>`);
  }
  static isConfigured() {
    return TestPlugin.configured;
  }
  static getName() {
    return TestPlugin.name;
  }
  static newTrace(t) {
    console.log("New trace: ", t)
  }
  static newLog(l) {
    console.log("New log: ", l)
  }
  static newMetric(m) {
    console.log("New metric: ", m)
  }
}

console.log("Instantiating plugin....");
const plugin = TestPlugin;
module.exports = { plugin };
console.log(`Plugin <${pluginName}> instantiated!`);

/*
2026-06-01T07:45:20.041Z [OAS-TLM-@-SERVICE-1C65C12A] [INFO]: [Plugin log] STDOUT: Instantiating plugin....
2026-06-01T07:45:20.041Z [OAS-TLM-@-SERVICE-1C65C12A] [INFO]: [Plugin log] STDOUT: Plugin <test plugin - log events> instantiated!
Configuring plugin <test plugin - log events> with config:
{}...

2026-06-01T07:45:24.883Z [OAS-TLM-@-SERVICE-1C65C12A] [INFO]: [Plugin log] STDOUT: New log:  {
  resource: { attributes: { service: [Object] } },
  instrumentationScope: { name: 'oas-telemetry' },
  timestamp: 1780299919881000,
  observedTimestamp: 1780299919881000,
  traceId: 'cc603fd92a33ed42b5a2c4a7fd90fac4',
  spanId: '67e7ce2947143670',
  traceFlags: 1,
  severityText: 'INFO',
  severityNumber: 9,
  body: '[2026-06-01T07:45:19.881Z] POST /telemetry/plugins {\n' +
    '  headers: {\n' +
    "    host: 'localhost:3000',\n" +
    "    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:150.0) Gecko/20100101 Firefox/150.0',\n" +
    "    accept: 'application/json, text/plain, *',\n" +
    "    'accept-language': 'en-US,en;q=0.9',\n" +
    "    'accept-encoding': 'gzip, deflate, br, zstd',\n" +
    "    'content-type': 'application/json',\n" +
    "    'content-length': '1028',\n" +
    "    origin: 'http://localhost:3000',\n" +
    "    'sec-gpc': '1',\n" +
    "    connection: 'keep-alive',\n" +
    "    referer: 'http://localhost:3000/telemetry/oas-telemetry-ui/plugins/create',\n" +
    "    'sec-fetch-dest': 'empty',\n" +
    "    'sec-fetch-mode': 'cors',\n" +
    "    'sec-fetch-site': 'same-origin',\n" +
    "    priority: 'u=0'\n" +
    '  },\n' +
    '  body: {\n' +
    "    id: 'log',\n" +
    "    name: 'logger',\n" +
    "    description: 'nada',\n" +
    "    moduleFormat: 'esm',\n" +
    `    code: 'const pluginName = "test plugin - log events";\\n' +\n` +
    "      '\\n' +\n" +
    "      'class TestPlugin {\\n' +\n" +
    `      '  static name = "";\\n' +\n` +
    "      '  static configured = false;\\n' +\n" +
    "      '  static load(config = {}) {\\n' +\n" +
    "      '    TestPlugin.name = pluginName;\\n' +\n" +
    "      '    console.log(\\n' +\n" +
    "      '      `Configuring plugin <${TestPlugin.name}> with config: \\\\n${JSON.stringify(config, null, 2)}...`,\\n' +\n" +
    "      '    );\\n' +\n" +
    "      '    TestPlugin.configured = true;\\n' +\n" +
    "      '  }\\n' +\n" +
    "      '  static unload() {\\n' +\n" +
    "      '    console.log(`Unloading plugin <${TestPlugin.name}>`);\\n' +\n" +
    "      '  }\\n' +\n" +
    "      '  static isConfigured() {\\n' +\n" +
    "      '    return TestPlugin.configured;\\n' +\n" +
    "      '  }\\n' +\n" +
    "      '  static getName() {\\n' +\n" +
    "      '    return TestPlugin.name;\\n' +\n" +
    "      '  }\\n' +\n" +
    "      '  static newTrace(t) {\\n' +\n" +
    `      '    console.log("New trace: ", t)\\n' +\n` +
    "      '  }\\n' +\n" +
    "      '  static newLog(l) {\\n' +\n" +
    `      '    console.log("New log: ", l)\\n' +\n` +
    "      '  }\\n' +\n" +
    "      '  static newMetric(m) {\\n' +\n" +
    `      '    console.log("New metric: ", m)\\n' +\n` +
    "      '  }\\n' +\n" +
    "      '}\\n' +\n" +
    "      '\\n' +\n" +
    `      'console.log("Instantiating plugin....");\\n' +\n` +
    "      'const plugin = TestPlugin;\\n' +\n" +
    "      'module.exports = { plugin };\\n' +\n" +
    "      'console.log(`Plugin <${pluginName}> instantiated!`);',\n" +
    '    install: {},\n' +
    '    config: {}\n' +
    '  }\n' +
    '}',
  attributes: { source: 'console.log', library: 'oas-telemetry' }
}
2026-06-01T07:45:24.883Z [OAS-TLM-@-SERVICE-1C65C12A] [INFO]: [Plugin log] STDOUT: New log:  {
  resource: { attributes: { service: [Object] } },
  instrumentationScope: { name: 'oas-telemetry' },
  timestamp: 1780299920068000,
  observedTimestamp: 1780299920068000,
  traceId: 'ab95cc51cdfbfafeb37a5faa1d7b8cc7',
  spanId: '9a7a2da4193a66fd',
  traceFlags: 1,
  severityText: 'INFO',
  severityNumber: 9,
  body: '[2026-06-01T07:45:20.068Z] GET /telemetry/plugins {\n' +
    '  headers: {\n' +
    "    host: 'localhost:3000',\n" +
    "    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:150.0) Gecko/20100101 Firefox/150.0',\n" +
    "    accept: 'application/json, text/plain, *',\n" +
    "    'accept-language': 'en-US,en;q=0.9',\n" +
    "    'accept-encoding': 'gzip, deflate, br, zstd',\n" +
    "    'sec-gpc': '1',\n" +
    "    connection: 'keep-alive',\n" +
    "    referer: 'http://localhost:3000/telemetry/oas-telemetry-ui/plugins',\n" +
    "    'sec-fetch-dest': 'empty',\n" +
    "    'sec-fetch-mode': 'cors',\n" +
    "    'sec-fetch-site': 'same-origin'\n" +
    '  },\n' +
    '  body: undefined\n' +
    '}',
  attributes: { source: 'console.log', library: 'oas-telemetry' }
}
2026-06-01T07:46:15.514Z [OAS-TLM-@-SERVICE-1C65C12A] [INFO]: [Plugin log] STDOUT: New metric:  {
  scope: { name: '@opentelemetry/host-metrics', version: '0.36.2' },
  metrics: [
    {
      descriptor: [Object],
      aggregationTemporality: 1,
      dataPointType: 3,
      dataPoints: [Array],
      isMonotonic: true
    },
    {
      descriptor: [Object],
      aggregationTemporality: 1,
      dataPointType: 2,
      dataPoints: [Array]
    },
    {
      descriptor: [Object],
      aggregationTemporality: 1,
      dataPointType: 2,
      dataPoints: [Array]
    },
    {
      descriptor: [Object],
      aggregationTemporality: 1,
      dataPointType: 2,
      dataPoints: [Array]
    },
    {
      descriptor: [Object],
      aggregationTemporality: 1,
      dataPointType: 3,
      dataPoints: [Array],
      isMonotonic: true
    },
    {
      descriptor: [Object],
      aggregationTemporality: 1,
      dataPointType: 3,
      dataPoints: [Array],
      isMonotonic: true
    },
    {
      descriptor: [Object],
      aggregationTemporality: 1,
      dataPointType: 3,
      dataPoints: [Array],
      isMonotonic: true
    },
    {
      descriptor: [Object],
      aggregationTemporality: 1,
      dataPointType: 3,
      dataPoints: [Array],
      isMonotonic: true
    },
    {
      descriptor: [Object],
      aggregationTemporality: 1,
      dataPointType: 2,
      dataPoints: [Array]
    },
    {
      descriptor: [Object],
      aggregationTemporality: 1,
      dataPointType: 2,
      dataPoints: [Array]
    }
  ]
}

*/