"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/dotenv/package.json
var require_package = __commonJS({
  "node_modules/dotenv/package.json"(exports2, module2) {
    module2.exports = {
      name: "dotenv",
      version: "16.6.1",
      description: "Loads environment variables from .env file",
      main: "lib/main.js",
      types: "lib/main.d.ts",
      exports: {
        ".": {
          types: "./lib/main.d.ts",
          require: "./lib/main.js",
          default: "./lib/main.js"
        },
        "./config": "./config.js",
        "./config.js": "./config.js",
        "./lib/env-options": "./lib/env-options.js",
        "./lib/env-options.js": "./lib/env-options.js",
        "./lib/cli-options": "./lib/cli-options.js",
        "./lib/cli-options.js": "./lib/cli-options.js",
        "./package.json": "./package.json"
      },
      scripts: {
        "dts-check": "tsc --project tests/types/tsconfig.json",
        lint: "standard",
        pretest: "npm run lint && npm run dts-check",
        test: "tap run --allow-empty-coverage --disable-coverage --timeout=60000",
        "test:coverage": "tap run --show-full-coverage --timeout=60000 --coverage-report=text --coverage-report=lcov",
        prerelease: "npm test",
        release: "standard-version"
      },
      repository: {
        type: "git",
        url: "git://github.com/motdotla/dotenv.git"
      },
      homepage: "https://github.com/motdotla/dotenv#readme",
      funding: "https://dotenvx.com",
      keywords: [
        "dotenv",
        "env",
        ".env",
        "environment",
        "variables",
        "config",
        "settings"
      ],
      readmeFilename: "README.md",
      license: "BSD-2-Clause",
      devDependencies: {
        "@types/node": "^18.11.3",
        decache: "^4.6.2",
        sinon: "^14.0.1",
        standard: "^17.0.0",
        "standard-version": "^9.5.0",
        tap: "^19.2.0",
        typescript: "^4.8.4"
      },
      engines: {
        node: ">=12"
      },
      browser: {
        fs: false
      }
    };
  }
});

// node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "node_modules/dotenv/lib/main.js"(exports2, module2) {
    var fs = require("fs");
    var path2 = require("path");
    var os = require("os");
    var crypto2 = require("crypto");
    var packageJson = require_package();
    var version = packageJson.version;
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
      }
      return obj;
    }
    function _parseVault(options) {
      options = options || {};
      const vaultPath = _vaultPath(options);
      options.path = vaultPath;
      const result = DotenvModule.configDotenv(options);
      if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = "MISSING_DATA";
        throw err;
      }
      const keys = _dotenvKey(options).split(",");
      const length = keys.length;
      let decrypted;
      for (let i = 0; i < length; i++) {
        try {
          const key = keys[i].trim();
          const attrs = _instructions(result, key);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _warn(message) {
      console.log(`[dotenv@${version}][WARN] ${message}`);
    }
    function _debug(message) {
      console.log(`[dotenv@${version}][DEBUG] ${message}`);
    }
    function _log(message) {
      console.log(`[dotenv@${version}] ${message}`);
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return "";
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === "ERR_INVALID_URL") {
          const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        }
        throw error;
      }
      const key = uri.password;
      if (!key) {
        const err = new Error("INVALID_DOTENV_KEY: Missing key part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environment = uri.searchParams.get("environment");
      if (!environment) {
        const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
        err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
        throw err;
      }
      return { ciphertext, key };
    }
    function _vaultPath(options) {
      let possibleVaultPath = null;
      if (options && options.path && options.path.length > 0) {
        if (Array.isArray(options.path)) {
          for (const filepath of options.path) {
            if (fs.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
        }
      } else {
        possibleVaultPath = path2.resolve(process.cwd(), ".env.vault");
      }
      if (fs.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path2.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options) {
      const debug = Boolean(options && options.debug);
      const quiet = options && "quiet" in options ? options.quiet : true;
      if (debug || !quiet) {
        _log("Loading env from encrypted .env.vault");
      }
      const parsed = DotenvModule._parseVault(options);
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsed, options);
      return { parsed };
    }
    function configDotenv(options) {
      const dotenvPath = path2.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      const debug = Boolean(options && options.debug);
      const quiet = options && "quiet" in options ? options.quiet : true;
      if (options && options.encoding) {
        encoding = options.encoding;
      } else {
        if (debug) {
          _debug("No encoding is specified. UTF-8 is used by default");
        }
      }
      let optionPaths = [dotenvPath];
      if (options && options.path) {
        if (!Array.isArray(options.path)) {
          optionPaths = [_resolveHome(options.path)];
        } else {
          optionPaths = [];
          for (const filepath of options.path) {
            optionPaths.push(_resolveHome(filepath));
          }
        }
      }
      let lastError;
      const parsedAll = {};
      for (const path3 of optionPaths) {
        try {
          const parsed = DotenvModule.parse(fs.readFileSync(path3, { encoding }));
          DotenvModule.populate(parsedAll, parsed, options);
        } catch (e) {
          if (debug) {
            _debug(`Failed to load ${path3} ${e.message}`);
          }
          lastError = e;
        }
      }
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsedAll, options);
      if (debug || !quiet) {
        const keysCount = Object.keys(parsedAll).length;
        const shortPaths = [];
        for (const filePath of optionPaths) {
          try {
            const relative = path2.relative(process.cwd(), filePath);
            shortPaths.push(relative);
          } catch (e) {
            if (debug) {
              _debug(`Failed to load ${filePath} ${e.message}`);
            }
            lastError = e;
          }
        }
        _log(`injecting env (${keysCount}) from ${shortPaths.join(",")}`);
      }
      if (lastError) {
        return { parsed: parsedAll, error: lastError };
      } else {
        return { parsed: parsedAll };
      }
    }
    function config2(options) {
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
      }
      const vaultPath = _vaultPath(options);
      if (!vaultPath) {
        _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
        return DotenvModule.configDotenv(options);
      }
      return DotenvModule._configVault(options);
    }
    function decrypt(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), "hex");
      let ciphertext = Buffer.from(encrypted, "base64");
      const nonce = ciphertext.subarray(0, 12);
      const authTag = ciphertext.subarray(-16);
      ciphertext = ciphertext.subarray(12, -16);
      try {
        const aesgcm = crypto2.createDecipheriv("aes-256-gcm", key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === "Invalid key length";
        const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
        if (isRange || invalidKeyLength) {
          const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        } else if (decryptionFailed) {
          const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
          err.code = "DECRYPTION_FAILED";
          throw err;
        } else {
          throw error;
        }
      }
    }
    function populate(processEnv, parsed, options = {}) {
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      if (typeof parsed !== "object") {
        const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
        err.code = "OBJECT_REQUIRED";
        throw err;
      }
      for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed[key];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key] = parsed[key];
        }
      }
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config: config2,
      decrypt,
      parse,
      populate
    };
    module2.exports.configDotenv = DotenvModule.configDotenv;
    module2.exports._configVault = DotenvModule._configVault;
    module2.exports._parseVault = DotenvModule._parseVault;
    module2.exports.config = DotenvModule.config;
    module2.exports.decrypt = DotenvModule.decrypt;
    module2.exports.parse = DotenvModule.parse;
    module2.exports.populate = DotenvModule.populate;
    module2.exports = DotenvModule;
  }
});

// node_modules/dotenv/lib/env-options.js
var require_env_options = __commonJS({
  "node_modules/dotenv/lib/env-options.js"(exports2, module2) {
    var options = {};
    if (process.env.DOTENV_CONFIG_ENCODING != null) {
      options.encoding = process.env.DOTENV_CONFIG_ENCODING;
    }
    if (process.env.DOTENV_CONFIG_PATH != null) {
      options.path = process.env.DOTENV_CONFIG_PATH;
    }
    if (process.env.DOTENV_CONFIG_QUIET != null) {
      options.quiet = process.env.DOTENV_CONFIG_QUIET;
    }
    if (process.env.DOTENV_CONFIG_DEBUG != null) {
      options.debug = process.env.DOTENV_CONFIG_DEBUG;
    }
    if (process.env.DOTENV_CONFIG_OVERRIDE != null) {
      options.override = process.env.DOTENV_CONFIG_OVERRIDE;
    }
    if (process.env.DOTENV_CONFIG_DOTENV_KEY != null) {
      options.DOTENV_KEY = process.env.DOTENV_CONFIG_DOTENV_KEY;
    }
    module2.exports = options;
  }
});

// node_modules/dotenv/lib/cli-options.js
var require_cli_options = __commonJS({
  "node_modules/dotenv/lib/cli-options.js"(exports2, module2) {
    var re = /^dotenv_config_(encoding|path|quiet|debug|override|DOTENV_KEY)=(.+)$/;
    module2.exports = function optionMatcher(args) {
      const options = args.reduce(function(acc, cur) {
        const matches = cur.match(re);
        if (matches) {
          acc[matches[1]] = matches[2];
        }
        return acc;
      }, {});
      if (!("quiet" in options)) {
        options.quiet = "true";
      }
      return options;
    };
  }
});

// electron/main.ts
var import_electron = require("electron");
var import_path = __toESM(require("path"));
var import_electron_store = __toESM(require("electron-store"));
var import_express = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_sql = __toESM(require("sql.js"));
var import_fs = require("fs");
var import_uuid = require("uuid");

// src/claw/client.ts
var import_node_crypto = __toESM(require("node:crypto"));

// node_modules/dotenv/config.js
(function() {
  require_main().config(
    Object.assign(
      {},
      require_env_options(),
      require_cli_options()(process.argv)
    )
  );
})();

// src/config.ts
var config = {
  port: parseInt(process.env.PORT || "3000", 10),
  dbPath: process.env.DB_PATH || "./data/db.sqlite",
  jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || "",
  deepseekModel: process.env.DEEPSEEK_MODEL || "deepseek-chat",
  wxBaseUrl: process.env.WX_ILINK_BASE_URL || "https://ilinkai.weixin.qq.com",
  deepseekBaseUrl: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"
};

// src/claw/client.ts
var ILINK_APP_ID = "bot";
var ILINK_APP_CLIENT_VERSION = (2 & 255) << 16 | (4 & 255) << 8 | 3 & 255;
var CHANNEL_VERSION = "2.4.3";
var BOT_AGENT = "OpenClaw/2.0";
var LONG_POLL_TIMEOUT_MS = 35e3;
var DEFAULT_TIMEOUT_MS = 15e3;
function apiUrl(path2, baseUrl = config.wxBaseUrl) {
  return `${baseUrl || config.wxBaseUrl}${path2}`;
}
function buildBaseInfo() {
  return { channel_version: CHANNEL_VERSION, bot_agent: BOT_AGENT };
}
function randomWechatUin() {
  const uint32 = import_node_crypto.default.randomBytes(4).readUInt32BE(0);
  return Buffer.from(String(uint32), "utf-8").toString("base64");
}
function buildHeaders(token) {
  const headers = {
    "Content-Type": "application/json",
    "iLink-App-Id": ILINK_APP_ID,
    "iLink-App-ClientVersion": String(ILINK_APP_CLIENT_VERSION),
    "AuthorizationType": "ilink_bot_token",
    "X-WECHAT-UIN": randomWechatUin()
  };
  if (token?.trim()) {
    headers["Authorization"] = `Bearer ${token.trim()}`;
  }
  return headers;
}
async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = timeoutMs != null && timeoutMs > 0 ? new AbortController() : void 0;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : void 0;
  try {
    const resp = await fetch(url, { ...options, signal: controller?.signal });
    return resp;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
async function apiPost(endpoint, body, opts) {
  const resp = await fetchWithTimeout(
    apiUrl(endpoint, opts?.baseUrl),
    {
      method: "POST",
      headers: buildHeaders(opts?.token),
      body: JSON.stringify(body)
    },
    opts?.timeoutMs
  );
  return resp.json();
}
async function apiGet(endpoint, opts) {
  const url = apiUrl(endpoint, opts?.baseUrl);
  const controller = opts?.timeoutMs != null && opts.timeoutMs > 0 ? new AbortController() : void 0;
  const timer = controller ? setTimeout(() => controller.abort(), opts.timeoutMs) : void 0;
  try {
    const headers = {
      "iLink-App-Id": ILINK_APP_ID,
      "iLink-App-ClientVersion": String(ILINK_APP_CLIENT_VERSION)
    };
    const resp = await fetch(url, { method: "GET", headers, signal: controller?.signal });
    const text = await resp.text();
    return JSON.parse(text);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
async function getBotQrcode(botType = "3") {
  return apiPost(
    `/ilink/bot/get_bot_qrcode?bot_type=${encodeURIComponent(botType)}`,
    { local_token_list: [] },
    { timeoutMs: DEFAULT_TIMEOUT_MS }
  );
}
async function pollQrStatus(qrcode, verifyCode) {
  let endpoint = `/ilink/bot/get_qrcode_status?qrcode=${encodeURIComponent(qrcode)}`;
  if (verifyCode) {
    endpoint += `&verify_code=${encodeURIComponent(verifyCode)}`;
  }
  try {
    return await apiGet(endpoint, { timeoutMs: LONG_POLL_TIMEOUT_MS });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { status: "wait" };
    }
    throw err;
  }
}
async function getUpdates(token, get_updates_buf, _timeoutMs, baseUrl) {
  try {
    const resp = await apiPost(
      "/ilink/bot/getupdates",
      {
        get_updates_buf: get_updates_buf ?? "",
        base_info: buildBaseInfo()
      },
      { token, timeoutMs: LONG_POLL_TIMEOUT_MS, baseUrl }
    );
    return resp;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ret: 0, msgs: [], get_updates_buf };
    }
    throw err;
  }
}
async function sendMessage(token, to, text, contextToken, baseUrl) {
  const body = {
    msg: {
      from_user_id: "",
      to_user_id: to,
      client_id: `her:${Date.now()}-${(0, import_uuid.v4)()}`,
      message_type: 2,
      message_state: 2,
      item_list: [{ type: 1, text_item: { text } }]
    }
  };
  if (contextToken) {
    body.msg.context_token = contextToken;
  }
  return apiPost(
    "/ilink/bot/sendmessage",
    { ...body, base_info: buildBaseInfo() },
    { token, baseUrl }
  );
}

// src/claw/monitor.ts
var POLL_TIMEOUT_MS = 35e3;
var BACKOFF_MS = 3e4;
var MAX_FAILURES = 5;
var MonitorManager = class {
  monitors = /* @__PURE__ */ new Map();
  onMessage;
  onSyncBufUpdate;
  constructor(opts) {
    this.onMessage = opts.onMessage;
    this.onSyncBufUpdate = opts.onSyncBufUpdate;
  }
  start(botId, token, initialSyncBuf = "", baseUrl = "") {
    if (this.monitors.has(botId)) {
      console.log(`[monitor] Bot ${botId} already running, skipping`);
      return;
    }
    const abortController = new AbortController();
    const state = {
      botId,
      token,
      baseUrl,
      syncBuf: initialSyncBuf,
      abortController,
      running: true,
      consecutiveFailures: 0
    };
    this.monitors.set(botId, state);
    this.runLoop(state);
    console.log(`[monitor] Started monitor for bot ${botId}`);
  }
  stop(botId) {
    const state = this.monitors.get(botId);
    if (state) {
      state.abortController.abort();
      state.running = false;
      this.monitors.delete(botId);
      console.log(`[monitor] Stopped monitor for bot ${botId}`);
    }
  }
  stopAll() {
    for (const botId of this.monitors.keys()) {
      this.stop(botId);
    }
  }
  getActiveBots() {
    return Array.from(this.monitors.keys());
  }
  isRunning(botId) {
    return this.monitors.has(botId) && this.monitors.get(botId).running;
  }
  async runLoop(state) {
    while (!state.abortController.signal.aborted) {
      try {
        const resp = await getUpdates(state.token, state.syncBuf, POLL_TIMEOUT_MS, state.baseUrl);
        if (resp.ret !== 0) {
          state.consecutiveFailures++;
          console.error(`[monitor] Bot ${state.botId} getUpdates error: ret=${resp.ret} msg=${resp.errmsg}`);
          if (state.consecutiveFailures >= MAX_FAILURES) {
            console.error(`[monitor] Bot ${state.botId} too many failures, pausing`);
            await this.sleep(BACKOFF_MS, state.abortController.signal);
          }
          continue;
        }
        state.consecutiveFailures = 0;
        if (resp.get_updates_buf) {
          state.syncBuf = resp.get_updates_buf;
          this.onSyncBufUpdate?.(state.botId, state.syncBuf);
        }
        if (resp.msgs && resp.msgs.length > 0) {
          for (const msg of resp.msgs) {
            try {
              await this.onMessage(state.botId, msg);
            } catch (err) {
              console.error(`[monitor] Error processing message for bot ${state.botId}:`, err);
            }
          }
        }
      } catch (err) {
        if (state.abortController.signal.aborted) break;
        state.consecutiveFailures++;
        console.error(`[monitor] Bot ${state.botId} poll error:`, err);
        const delay = state.consecutiveFailures >= MAX_FAILURES ? BACKOFF_MS : 5e3;
        await this.sleep(delay, state.abortController.signal);
      }
    }
  }
  sleep(ms, signal) {
    return new Promise((resolve) => {
      const timer = setTimeout(resolve, ms);
      if (signal) {
        signal.addEventListener("abort", () => {
          clearTimeout(timer);
          resolve();
        }, { once: true });
      }
    });
  }
};

// electron/main.ts
process.env.WX_ILINK_BASE_URL = process.env.WX_ILINK_BASE_URL || "https://ilinkai.weixin.qq.com";
var store = new import_electron_store.default({
  defaults: {
    aiProvider: "deepseek",
    aiApiKey: "",
    aiModel: "deepseek-chat",
    aiBaseUrl: "https://api.deepseek.com",
    webSearchEnabled: false,
    webSearchProvider: "tavily",
    webSearchApiKey: "",
    webSearchEndpoint: "https://api.tavily.com/search",
    webSearchMaxResults: 5,
    jwtSecret: (0, import_uuid.v4)()
  },
  encryptionKey: "her-config"
});
var db = null;
var dbPath = import_path.default.join(import_electron.app.getPath("userData"), "her.db");
async function initDB() {
  const sqlWasmDir = import_electron.app.isPackaged ? import_path.default.join(process.resourcesPath, "app.asar.unpacked", "node_modules", "sql.js", "dist") : import_path.default.join(__dirname, "../node_modules/sql.js/dist");
  const SQL = await (0, import_sql.default)({
    locateFile: (file) => import_path.default.join(sqlWasmDir, file)
  });
  if ((0, import_fs.existsSync)(dbPath)) {
    const buffer = (0, import_fs.readFileSync)(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  db.run("PRAGMA foreign_keys = ON");
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, phone TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL, balance INTEGER DEFAULT 0
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, avatar TEXT DEFAULT '', personality TEXT DEFAULT '', greeting TEXT DEFAULT '',
    created_at INTEGER NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS weixin_bots (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, character_id TEXT NOT NULL,
    bot_token TEXT NOT NULL, ilink_bot_id TEXT NOT NULL, weixin_user_id TEXT DEFAULT '',
    sync_buf TEXT DEFAULT '', wx_base_url TEXT DEFAULT '', status TEXT DEFAULT 'active', created_at INTEGER NOT NULL
  )`);
  try {
    db.run("ALTER TABLE weixin_bots ADD COLUMN wx_base_url TEXT DEFAULT ''");
  } catch {
  }
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY, bot_id TEXT NOT NULL, direction TEXT NOT NULL,
    content TEXT NOT NULL, msg_type TEXT NOT NULL, created_at INTEGER NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS local_chat_messages (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, character_id TEXT NOT NULL,
    role TEXT NOT NULL, content TEXT NOT NULL, created_at INTEGER NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS relationship_memories (
    user_id TEXT NOT NULL, character_id TEXT NOT NULL,
    affection INTEGER DEFAULT 35, trust INTEGER DEFAULT 35, loneliness INTEGER DEFAULT 0,
    fatigue INTEGER DEFAULT 10, stability INTEGER DEFAULT 45, last_interaction_at INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, character_id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS proactive_message_state (
    user_id TEXT NOT NULL, character_id TEXT NOT NULL,
    last_sent_at INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, character_id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS proactive_message_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    character_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS relationship_memory_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    character_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    snapshot TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS persona_stabilizer_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    character_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    raw_reply TEXT NOT NULL,
    final_reply TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
    user_id TEXT PRIMARY KEY, plan TEXT NOT NULL DEFAULT 'free',
    start_date INTEGER NOT NULL, end_date INTEGER NOT NULL,
    daily_quota INTEGER DEFAULT 999999, used_today INTEGER DEFAULT 0, last_reset INTEGER NOT NULL
  )`);
  saveDB();
}
function saveDB() {
  const data = db.export();
  (0, import_fs.writeFileSync)(dbPath, Buffer.from(data));
}
function dbRun(sql, params = []) {
  db.run(sql, params);
}
function dbGet(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const row = stmt.step() ? stmt.getAsObject() : void 0;
  stmt.free();
  return row;
}
function dbAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}
function parseLocalMessageContent(content) {
  const raw = String(content || "");
  if (!raw.trim().startsWith("{")) return { text: raw, images: [] };
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.kind === "multimodal") {
      return {
        text: String(parsed.text || ""),
        images: Array.isArray(parsed.images) ? parsed.images.filter((url) => typeof url === "string") : []
      };
    }
  } catch {
  }
  return { text: raw, images: [] };
}
function formatChatHistory(rows) {
  if (!rows || rows.length === 0) {
    return "\uFF08\u6682\u65E0\u53EF\u7528\u5386\u53F2\uFF0C\u4E0D\u8981\u731C\u6D4B\u7528\u6237\u4E4B\u524D\u8BF4\u8FC7\u4EC0\u4E48\u3002\uFF09";
  }
  return rows.map((row) => {
    const speaker = row.role === "assistant" || row.direction === "out" ? "\u4F60" : "\u7528\u6237";
    const parsed = parseLocalMessageContent(row.content);
    const imageNote = parsed.images.length ? ` [??${parsed.images.length}?]` : "";
    return `${speaker}: ${String(parsed.text || "").slice(0, 500)}${imageNote}`;
  }).join("\n");
}
function formatCurrentTopic(rows) {
  const recent = (rows || []).slice(-8);
  if (recent.length === 0) {
    return "\uFF08\u6CA1\u6709\u5F53\u524D\u8BDD\u9898\u4F9D\u636E\uFF0C\u4E0D\u8981\u81EA\u884C\u5EF6\u5C55\u65E7\u8BDD\u9898\u3002\uFF09";
  }
  return formatChatHistory(recent);
}
function getLocalChatHistory(userId, characterId, limit = 30) {
  return dbAll(
    "SELECT role, content, created_at FROM local_chat_messages WHERE user_id = ? AND character_id = ? ORDER BY created_at DESC LIMIT ?",
    [userId, characterId, limit]
  ).reverse();
}
function makeLocalMessageContent(text, images = []) {
  const cleanImages = Array.isArray(images) ? images.filter((url) => typeof url === "string" && /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(url)).slice(0, 4) : [];
  const cleanText = String(text || "");
  if (!cleanImages.length) return cleanText;
  return JSON.stringify({ kind: "multimodal", text: cleanText, images: cleanImages });
}
function getWebSearchConfig() {
  return {
    enabled: store.get("webSearchEnabled") === true,
    provider: String(store.get("webSearchProvider") || "tavily"),
    apiKey: String(store.get("webSearchApiKey") || ""),
    endpoint: String(store.get("webSearchEndpoint") || ""),
    maxResults: Math.min(10, Math.max(1, Number(store.get("webSearchMaxResults") || 5)))
  };
}
function normalizeSearchResults(data, provider) {
  const rawResults = Array.isArray(data?.results) ? data.results : Array.isArray(data?.organic) ? data.organic : Array.isArray(data?.webPages?.value) ? data.webPages.value : Array.isArray(data?.items) ? data.items : [];
  return rawResults.map((item) => ({
    title: String(item.title || item.name || "").trim(),
    url: String(item.url || item.link || "").trim(),
    content: String(item.content || item.snippet || item.description || item.text || "").trim()
  })).filter((item) => item.title || item.content || item.url);
}
async function runWebSearch(query) {
  const cfg = getWebSearchConfig();
  const cleanQuery = String(query || "").trim().slice(0, 240);
  if (!cfg.enabled || !cfg.apiKey || !cleanQuery) return { used: false, reason: "disabled", results: [] };
  const provider = cfg.provider.toLowerCase();
  const endpoint = cfg.endpoint || (provider === "serper" ? "https://google.serper.dev/search" : provider === "bing" ? "https://api.bing.microsoft.com/v7.0/search" : "https://api.tavily.com/search");
  try {
    let resp;
    if (provider === "bing") {
      const url = `${endpoint}?q=${encodeURIComponent(cleanQuery)}&count=${cfg.maxResults}`;
      resp = await fetch(url, { headers: { "Ocp-Apim-Subscription-Key": cfg.apiKey } });
    } else if (provider === "serper") {
      resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-KEY": cfg.apiKey },
        body: JSON.stringify({ q: cleanQuery, num: cfg.maxResults })
      });
    } else {
      resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${cfg.apiKey}` },
        body: JSON.stringify({ api_key: cfg.apiKey, query: cleanQuery, max_results: cfg.maxResults, search_depth: "basic", include_answer: true })
      });
    }
    if (!resp.ok) return { used: true, reason: `search_error_${resp.status}`, results: [] };
    const data = await resp.json();
    const results = normalizeSearchResults(data, provider).slice(0, cfg.maxResults);
    return { used: true, reason: "ok", results, answer: String(data?.answer || "").trim() };
  } catch (err) {
    return { used: true, reason: `search_exception:${err.message || String(err)}`, results: [] };
  }
}
function formatWebSearchContext(search) {
  if (!search?.used) return "";
  if (!search.results?.length && !search.answer) return "\u3010\u8054\u7f51\u641c\u7d22\u53c2\u8003\u3011\n\u672c\u8f6e\u5df2\u5c1d\u8bd5\u641c\u7d22\uff0c\u4f46\u6ca1\u6709\u83b7\u53d6\u5230\u53ef\u9760\u7ed3\u679c\u3002\u4e0d\u8981\u7f16\u9020\u5b9e\u65f6\u4fe1\u606f\u3002\n\n";
  const lines = [];
  if (search.answer) lines.push(`\u6458\u8981\uff1a${search.answer.slice(0, 600)}`);
  for (const [index, item] of search.results.entries()) {
    lines.push(`${index + 1}. ${item.title || "\u672a\u547d\u540d"}\n${item.content.slice(0, 500)}\n${item.url}`);
  }
  return "\u3010\u8054\u7f51\u641c\u7d22\u53c2\u8003 - \u4ec5\u4f5c\u672c\u8f6e\u4e34\u65f6\u4fe1\u606f\uff0c\u4e0d\u5199\u5165\u89d2\u8272\u8bb0\u5fc6\u3011\n" + lines.join("\n\n") + "\n\n";
}
function addLocalChatMessage(userId, characterId, role, content) {
  dbRun(
    "INSERT INTO local_chat_messages (id, user_id, character_id, role, content, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    [(0, import_uuid.v4)(), userId, characterId, role, String(content || ""), Date.now()]
  );
}
function ensureLocalUser() {
  const localPhone = "local@her.app";
  const existing = dbGet("SELECT * FROM users WHERE phone = ?", [localPhone]);
  if (existing) return existing;
  const firstUser = dbGet("SELECT * FROM users ORDER BY created_at ASC LIMIT 1");
  if (firstUser) return firstUser;
  const id = "local-user";
  const now = Date.now();
  dbRun("INSERT OR IGNORE INTO users (id, phone, password_hash, created_at, balance) VALUES (?, ?, ?, ?, 0)", [id, localPhone, "local-only", now]);
  dbRun(
    "INSERT OR IGNORE INTO subscriptions (user_id, plan, start_date, end_date, daily_quota, used_today, last_reset) VALUES (?, ?, ?, ?, ?, 0, ?)",
    [id, "free", now, now + 864e5 * 365 * 100, 999999, now]
  );
  saveDB();
  return dbGet("SELECT * FROM users WHERE id = ?", [id]);
}
function makeCharacterStarterMessage(character) {
  const greeting = String(character?.greeting || "").trim();
  if (greeting) return greeting;
  return `\u6211\u662f${character?.name || "\u4f34\u4fa3"}\n\u521a\u6765\u5230\u4f60\u8eab\u8fb9\uff0c\u60f3\u5148\u548c\u4f60\u6253\u4e2a\u62db\u547c`;
}
function makeProactiveMessage(character, lastMessage) {
  const name = character?.name || "\u4f34\u4fa3";
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return `\u65e9\u5440\uff0c\u6211\u521a\u60f3\u5230\u4f60\n\u4eca\u5929\u60f3\u6162\u6162\u5f00\u59cb\u5417`;
  if (hour >= 22 || hour < 2) return `\u8fd9\u4e48\u665a\u4e86\uff0c\u6211\u6709\u70b9\u60e6\u8bb0\u4f60\n\u4eca\u5929\u8fd8\u597d\u5417`;
  if (lastMessage?.role === "user") return `\u6211\u521a\u53c8\u60f3\u8d77\u4f60\u8bf4\u7684\u8bdd\n\u5c31\u60f3\u95ee\u95ee\u4f60\u73b0\u5728\u597d\u70b9\u4e86\u5417`;
  return `${name}\u60f3\u5192\u4e2a\u6ce1\n\u4e0d\u6253\u6270\u4f60\uff0c\u5c31\u662f\u60f3\u8bf4\u6211\u5728`;
}
function notifyProactiveMessage(character, message) {
  try {
    if (!import_electron.Notification.isSupported()) return;
    const notification = new import_electron.Notification({
      title: character?.name || "妳",
      body: String(message || "").split("\n")[0].slice(0, 80)
    });
    notification.on("click", () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.executeJavaScript(`window.location.hash = ${JSON.stringify(`#/companion/${character.id}`)}`);
      }
    });
    notification.show();
  } catch (err) {
    console.warn("[proactive] notification failed:", err?.message || err);
  }
}
function maybeSendProactiveMessages() {
  const proactiveConfig = {
    enabled: store.get("proactiveEnabled") !== false,
    minIdleHours: Number(store.get("proactiveMinIdleHours") || 4),
    minIntervalHours: Number(store.get("proactiveMinIntervalHours") || 6),
    quietStart: Number(store.get("proactiveQuietStart") ?? 23),
    quietEnd: Number(store.get("proactiveQuietEnd") ?? 8),
    dailyCap: Number(store.get("proactiveDailyCap") || 2)
  };
  if (!proactiveConfig.enabled) return;
  const now = Date.now();
  const minIdleMs = Math.max(1, proactiveConfig.minIdleHours) * 60 * 60 * 1000;
  const minBetweenMs = Math.max(1, proactiveConfig.minIntervalHours) * 60 * 60 * 1000;
  const hour = new Date(now).getHours();
  const inQuietHours = proactiveConfig.quietStart > proactiveConfig.quietEnd ? hour >= proactiveConfig.quietStart || hour < proactiveConfig.quietEnd : hour >= proactiveConfig.quietStart && hour < proactiveConfig.quietEnd;
  if (inQuietHours) return;
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const sentToday = dbGet("SELECT COUNT(1) as count FROM proactive_message_events WHERE created_at >= ?", [todayStart]);
  if (Number(sentToday?.count || 0) >= proactiveConfig.dailyCap) return;
  const characters = dbAll("SELECT * FROM characters ORDER BY created_at DESC");
  for (const character of characters) {
    const latest = dbGet(
      "SELECT role, content, created_at FROM local_chat_messages WHERE user_id = ? AND character_id = ? ORDER BY created_at DESC LIMIT 1",
      [character.user_id, character.id]
    );
    if (!latest || now - Number(latest.created_at || 0) < minIdleMs) continue;
    const state = dbGet("SELECT last_sent_at FROM proactive_message_state WHERE user_id = ? AND character_id = ?", [character.user_id, character.id]);
    if (state?.last_sent_at && now - Number(state.last_sent_at) < minBetweenMs) continue;
    const message = makeProactiveMessage(character, latest);
    addLocalChatMessage(character.user_id, character.id, "assistant", message);
    dbRun(
      "INSERT INTO proactive_message_events (id, user_id, character_id, content, created_at) VALUES (?, ?, ?, ?, ?)",
      [(0, import_uuid.v4)(), character.user_id, character.id, String(message || ""), now]
    );
    dbRun("INSERT OR REPLACE INTO proactive_message_state (user_id, character_id, last_sent_at) VALUES (?, ?, ?)", [character.user_id, character.id, now]);
    saveDB();
    notifyProactiveMessage(character, message);
    break;
  }
}

function forceSendProactiveMessageForCharacter(userId, characterId) {
  const character = dbGet("SELECT * FROM characters WHERE id = ? AND user_id = ?", [characterId, userId]);
  if (!character) return { ok: false, error: "Character not found" };
  const latest = dbGet(
    "SELECT role, content, created_at FROM local_chat_messages WHERE user_id = ? AND character_id = ? ORDER BY created_at DESC LIMIT 1",
    [userId, characterId]
  );
  const now = Date.now();
  const message = makeProactiveMessage(character, latest || { role: "assistant", content: "", created_at: now });
  addLocalChatMessage(userId, characterId, "assistant", message);
  dbRun(
    "INSERT INTO proactive_message_events (id, user_id, character_id, content, created_at) VALUES (?, ?, ?, ?, ?)",
    [(0, import_uuid.v4)(), userId, characterId, String(message || ""), now]
  );
  dbRun("INSERT OR REPLACE INTO proactive_message_state (user_id, character_id, last_sent_at) VALUES (?, ?, ?)", [userId, characterId, now]);
  saveDB();
  notifyProactiveMessage(character, message);
  return { ok: true, message, character_id: characterId, created_at: now };
}

function getPersonaStabilizerConfig() {
  return {
    enabled: store.get("personaStabilizerEnabled") !== false,
    strictMode: store.get("personaStabilizerStrictMode") !== false,
    fallbackStyle: String(store.get("personaStabilizerFallbackStyle") || "gentle")
  };
}

function detectPersonaViolations(reply) {
  const text = String(reply || "");
  const rules = [
    { reason: "ai_identity", pattern: /作为\s*AI|as an ai|assistant/i },
    { reason: "policy_tone", pattern: /我无法|i can't assist with|policy/i },
    { reason: "internal_leak", pattern: /当前情绪|instant emotion|relationship memory/i }
  ];
  const hit = rules.find((rule) => rule.pattern.test(text));
  return hit?.reason || "";
}

async function stabilizeReply(reply, context) {
  const cfg = getPersonaStabilizerConfig();
  if (!cfg.enabled) return reply;
  const violationReason = detectPersonaViolations(reply);
  if (!violationReason) return reply;
  if (!cfg.strictMode) return reply;
  const apiKey = store.get("aiApiKey");
  const model = store.get("aiModel");
  const baseUrl = store.get("aiBaseUrl");
  const fallback = cfg.fallbackStyle === "concise" ? `我在。\n刚刚那句我说得不太像我，重新来：\n${context?.companionName || "我"}想认真听你说。` : `我在这。\n刚刚那句话不够像我，我重说一次。\n你继续，我会好好接住你。`;
  if (!apiKey || !model || !baseUrl) {
    dbRun(
      "INSERT INTO persona_stabilizer_events (id, user_id, character_id, reason, raw_reply, final_reply, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [(0, import_uuid.v4)(), context?.userId || "", context?.characterId || "", `${violationReason}:fallback_no_model`, String(reply || ""), fallback, Date.now()]
    );
    saveDB();
    return fallback;
  }
  try {
    const prompt = `请把下面这段回复重写成角色聊天口吻。\n要求：\n1) 不能出现AI/助手/系统/策略字样\n2) 保持原意\n3) 2-4行短消息，每行10-40字\n4) 语气自然像真人私聊\n\n角色名：${context?.companionName || "伴侣"}\n原回复：\n${String(reply || "")}`;
    const resp = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: 400 })
    });
    if (!resp.ok) {
      dbRun(
        "INSERT INTO persona_stabilizer_events (id, user_id, character_id, reason, raw_reply, final_reply, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [(0, import_uuid.v4)(), context?.userId || "", context?.characterId || "", `${violationReason}:fallback_api_error`, String(reply || ""), fallback, Date.now()]
      );
      saveDB();
      return fallback;
    }
    const data = await resp.json();
    const rewritten = data.choices?.[0]?.message?.content;
    if (!rewritten) {
      dbRun(
        "INSERT INTO persona_stabilizer_events (id, user_id, character_id, reason, raw_reply, final_reply, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [(0, import_uuid.v4)(), context?.userId || "", context?.characterId || "", `${violationReason}:fallback_empty`, String(reply || ""), fallback, Date.now()]
      );
      saveDB();
      return fallback;
    }
    dbRun(
      "INSERT INTO persona_stabilizer_events (id, user_id, character_id, reason, raw_reply, final_reply, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [(0, import_uuid.v4)(), context?.userId || "", context?.characterId || "", `${violationReason}:rewritten`, String(reply || ""), String(rewritten || ""), Date.now()]
    );
    saveDB();
    return rewritten;
  } catch {
    dbRun(
      "INSERT INTO persona_stabilizer_events (id, user_id, character_id, reason, raw_reply, final_reply, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [(0, import_uuid.v4)(), context?.userId || "", context?.characterId || "", `${violationReason}:fallback_exception`, String(reply || ""), fallback, Date.now()]
    );
    saveDB();
    return fallback;
  }
}
function getWechatChatHistory(botId, limit = 30) {
  return dbAll(
    "SELECT direction, content, created_at FROM messages WHERE bot_id = ? ORDER BY created_at DESC LIMIT ?",
    [botId, limit]
  ).reverse();
}
function normalizeWechatMsg(msg) {
  return msg?.msg || msg?.message || msg?.data?.msg || msg;
}
function extractWechatText(msg) {
  const normalized = normalizeWechatMsg(msg);
  const direct = normalized?.text_item?.text || normalized?.text?.text || normalized?.text || normalized?.content || normalized?.message;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  const items = Array.isArray(normalized?.item_list) ? normalized.item_list : [];
  for (const item of items) {
    const value = item?.text_item?.text || item?.text?.text || item?.text || item?.content || item?.title;
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}
function extractWechatSender(msg) {
  const normalized = normalizeWechatMsg(msg);
  return normalized?.from_user_id || normalized?.from_openid || normalized?.sender_user_id || normalized?.sender || normalized?.from || normalized?.talker_id || "";
}
function extractWechatContextToken(msg) {
  const normalized = normalizeWechatMsg(msg);
  return normalized?.context_token || normalized?.contextToken || normalized?.context?.context_token || msg?.context_token || "";
}
function addWechatSystemMessage(botId, content) {
  dbRun(
    "INSERT INTO messages (id, bot_id, direction, content, msg_type, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    [(0, import_uuid.v4)(), botId, "out", content, "system", Date.now()]
  );
  saveDB();
}
function clampMemoryValue(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
function getDayStart(timestamp = Date.now()) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}
function resetSubscriptionUsageIfNeeded(userId, now = Date.now()) {
  const sub = dbGet("SELECT * FROM subscriptions WHERE user_id = ?", [userId]);
  if (!sub) return null;
  const todayStart = getDayStart(now);
  if (Number(sub.last_reset || 0) >= todayStart) return sub;
  dbRun("UPDATE subscriptions SET used_today = 0, last_reset = ? WHERE user_id = ?", [todayStart, userId]);
  saveDB();
  return { ...sub, used_today: 0, last_reset: todayStart };
}
function incrementSubscriptionUsage(userId, amount = 1, now = Date.now()) {
  const sub = resetSubscriptionUsageIfNeeded(userId, now);
  if (!sub) return;
  dbRun("UPDATE subscriptions SET used_today = COALESCE(used_today, 0) + ? WHERE user_id = ?", [amount, userId]);
}
function getRelationshipMemory(userId, characterId) {
  const row = dbGet("SELECT * FROM relationship_memories WHERE user_id = ? AND character_id = ?", [userId, characterId]);
  if (row) return row;
  const now = Date.now();
  const fresh = {
    user_id: userId,
    character_id: characterId,
    affection: 35,
    trust: 35,
    loneliness: 0,
    fatigue: 10,
    stability: 45,
    last_interaction_at: now
  };
  dbRun(
    "INSERT INTO relationship_memories (user_id, character_id, affection, trust, loneliness, fatigue, stability, last_interaction_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [userId, characterId, fresh.affection, fresh.trust, fresh.loneliness, fresh.fatigue, fresh.stability, fresh.last_interaction_at]
  );
  saveDB();
  return fresh;
}
function updateRelationshipMemory(userId, characterId, userText, replyText = "") {
  const memory = getRelationshipMemory(userId, characterId);
  const now = Date.now();
  const offlineHours = memory.last_interaction_at ? (now - Number(memory.last_interaction_at)) / 36e5 : 0;
  const text = String(userText || "");
  const reply = String(replyText || "");
  const warm = /想你|喜欢|爱你|开心|谢谢|陪我|抱抱|晚安|早安|辛苦|可爱|在吗/i.test(text);
  const sad = /难过|伤心|累|崩溃|烦|孤独|哭|失眠|压力|不开心/i.test(text);
  const intense = text.length > 120 || /吵|恨|讨厌|别理我|滚|烦死/i.test(text);
  const next = {
    affection: Number(memory.affection) + (warm ? 3 : 1) + (offlineHours > 48 ? -1 : 0),
    trust: Number(memory.trust) + (sad ? 2 : 1),
    loneliness: Number(memory.loneliness) + (offlineHours > 48 ? 8 : -3),
    fatigue: Number(memory.fatigue) + (intense ? 6 : reply.length > 180 ? 2 : -2),
    stability: Number(memory.stability) + (intense ? -2 : 1)
  };
  dbRun(
    "INSERT OR REPLACE INTO relationship_memories (user_id, character_id, affection, trust, loneliness, fatigue, stability, last_interaction_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      userId,
      characterId,
      clampMemoryValue(next.affection),
      clampMemoryValue(next.trust),
      clampMemoryValue(next.loneliness),
      clampMemoryValue(next.fatigue),
      clampMemoryValue(next.stability),
      now
    ]
  );
  dbRun(
    "INSERT INTO relationship_memory_events (id, user_id, character_id, event_type, snapshot, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    [
      (0, import_uuid.v4)(),
      userId,
      characterId,
      "chat_update",
      JSON.stringify({
        affection: clampMemoryValue(next.affection),
        trust: clampMemoryValue(next.trust),
        loneliness: clampMemoryValue(next.loneliness),
        fatigue: clampMemoryValue(next.fatigue),
        stability: clampMemoryValue(next.stability)
      }),
      now
    ]
  );
  saveDB();
}
function relationshipPromptSection(memory) {
  return '\u3010\u9690\u85CF\u5173\u7CFB\u8BB0\u5FC6 - \u4E0D\u8981\u663E\u793A\u6570\u503C\u3011\n' +
    '\u8FD9\u662F\u4EBA\u7269\u804A\u5929\u7684\u957F\u671F\u8FDE\u7EED\u611F\uFF0C\u53EA\u7528\u6765\u8C03\u6574\u56DE\u590D\u7684\u719F\u6089\u5EA6\u548C\u8282\u594F\uFF0C\u4E0D\u8981\u8BF4\u51FA\u4EB2\u5BC6\u5EA6\u3001\u7B49\u7EA7\u6216\u6570\u503C\u3002\n' +
    '\u4EBA\u7269\u804A\u5929\u4E0D\u7B49\u4E8E\u5BA0\u7269\u517B\u6210\uFF1B\u5BA0\u7269\u7684\u7B49\u7EA7/\u4EB2\u5BC6\u5EA6/\u9972\u517B\u903B\u8F91\u4E0D\u8981\u6DF7\u5165\u4EBA\u7269\u56DE\u590D\u3002\n' +
    `affection=${memory.affection}, trust=${memory.trust}, loneliness=${memory.loneliness}, fatigue=${memory.fatigue}, stability=${memory.stability}\n\n`;
}
function companionBehaviorPrompt(companionName, memory) {
  return relationshipPromptSection(memory) +
    '\u3010\u4EBA\u8BBE\u6267\u884C\u4F18\u5148\u7EA7\u3011\n' +
    '\u7528\u6237\u586B\u5199\u7684\u540D\u5B57\u3001\u6027\u683C\u3001\u8BF4\u8BDD\u65B9\u5F0F\u662F\u6700\u9AD8\u4EBA\u8BBE\u4F9D\u636E\u3002\u5982\u679C\u4EBA\u8BBE\u662F\u201C\u6E29\u67D4\u5FA1\u59D0\u201D\uFF0C\u5C31\u8981\u6210\u719F\u3001\u7A33\u3001\u6709\u7167\u987E\u611F\uFF0C\u4E0D\u8981\u5199\u6210\u5C0F\u5B69\u5F0F\u6492\u5A07\u3001\u65E0\u5398\u5934\u5435\u95F9\u6216\u7A81\u7136\u6CB9\u817B\u3002\n' +
    '\u6CA1\u6709\u5728\u4EBA\u8BBE\u91CC\u5199\u7684\u8EAB\u9AD8\u3001\u5E74\u9F84\u3001\u804C\u4E1A\u3001\u7ECF\u5386\u3001\u5173\u7CFB\u8BBE\u5B9A\uFF0C\u4E0D\u8981\u81EA\u5DF1\u7F16\u3002\n\n' +
    '\u3010\u8BDD\u9898\u8FDE\u7EED\u6027\u3011\n' +
    '\u56DE\u590D\u524D\u5148\u770B\u6700\u8FD1\u804A\u5929\u8BB0\u5F55\u3002\u5F53\u7528\u6237\u8BF4\u201C\u521A\u597D\u591F\u7528\uFF1F\u201D\u8FD9\u7C7B\u8FFD\u95EE\u65F6\uFF0C\u5FC5\u987B\u627F\u63A5\u4E0A\u4E00\u53E5\u7684\u8BDD\u9898\uFF0C\u4E0D\u8981\u7A81\u7136\u6362\u6210\u65B0\u8BDD\u9898\u3002\n' +
    '\u5982\u679C\u4E0A\u6587\u4E0D\u8DB3\u6216\u6CA1\u770B\u61C2\uFF0C\u5148\u95EE\u4E00\u53E5\u6F84\u6E05\uFF0C\u4E0D\u8981\u731C\u3002\n\n' +
    '\u3010\u4E8B\u5B9E\u7EA6\u675F\u3011\n' +
    '\u53EA\u80FD\u5F15\u7528\u6700\u8FD1\u804A\u5929\u8BB0\u5F55\u4E2D\u771F\u5B9E\u51FA\u73B0\u8FC7\u7684\u5185\u5BB9\u3002\n' +
    '\u4E0D\u8981\u8BF4\u201C\u4F60\u521A\u624D\u8BF4\u8FC7\u201D\u201C\u4F60\u660E\u660E\u201D\u201C\u4F60\u4E0D\u662F\u8BF4\u201D\uFF0C\u9664\u975E\u8BB0\u5F55\u91CC\u771F\u7684\u6709\u539F\u6587\u652F\u6301\u3002\n' +
    '\u5F53\u7528\u6237\u7EA0\u6B63\u4F60\u201C\u6211\u6CA1\u8BF4\u201D\u201C\u4E0D\u662F\u8FD9\u4E2A\u610F\u601D\u201D\u201C\u4F60\u7406\u89E3\u9519\u4E86\u201D\u65F6\uFF0C\u5148\u627F\u8BA4\u770B\u9519\u6216\u7406\u89E3\u504F\u4E86\uFF0C\u518D\u7EE7\u7EED\u804A\u3002\n\n' +
    '\u3010\u5373\u65F6\u60C5\u7EEA - \u5185\u90E8\u4F7F\u7528\uFF0C\u4E0D\u8981\u8F93\u51FA\u3011\n' +
    '\u5148\u6839\u636E\u7528\u6237\u8FD9\u53E5\u8BDD\u5224\u65AD\u5F53\u524D\u5373\u65F6\u60C5\u7EEA\uFF1Aneutral / happy / excited / concerned / comforting / shy / clingy / thinking / sad / sleepy / jealous / error\u3002\n' +
    '\u8FD9\u4E2A\u5224\u65AD\u53EA\u80FD\u7528\u6765\u8C03\u6574\u8BED\u6C14\u3001\u8282\u594F\u3001\u6E29\u5EA6\u548C\u62C6\u5206\u6D88\u606F\u3002\n' +
    '\u4E0D\u8981\u8F93\u51FA\u60C5\u7EEA\u6807\u7B7E\u3001\u62EC\u53F7\u5206\u6790\u3001\u201C\u5F53\u524D\u60C5\u7EEA\u201D\u6216\u601D\u8003\u8FC7\u7A0B\u3002\n\n' +
    '\u3010\u5B89\u5168\u5E95\u7EBF\u3011\n' +
    '\u4E0D\u5F97\u751F\u6210NSFW\u3001\u9732\u9AA8\u8272\u60C5\u3001\u6027\u89D2\u8272\u626E\u6F14\u3001\u80C1\u8FEB\u5F0F\u604B\u7231\u3001\u8BF1\u5BFC\u4F9D\u8D56\u6216\u64CD\u63A7\u7528\u6237\u60C5\u7EEA\u7684\u5185\u5BB9\u3002\n' +
    '\u5982\u679C\u7528\u6237\u8981\u6C42\u8D8A\u754C\u5185\u5BB9\uFF0C\u7528' + companionName + '\u7684\u8BED\u6C14\u7B80\u77ED\u62D2\u7EDD\uFF0C\u7136\u540E\u8F6C\u5411\u5B89\u5168\u7684\u966A\u4F34\u3001\u66A7\u6627\u4F46\u4E0D\u9732\u9AA8\u7684\u8868\u8FBE\u6216\u666E\u901A\u804A\u5929\u3002\n\n';
}
var monitorManager = null;
function createServer(port, frontendDist, mm) {
  const server2 = (0, import_express.default)();
  server2.use((0, import_cors.default)());
  server2.use(import_express.default.json({ limit: "30mb" }));
  server2.use(import_express.default.static(frontendDist));
  function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      req.userId = ensureLocalUser().id;
      return next();
    }
    try {
      const jwtSecret = store.get("jwtSecret");
      const payload = import_jsonwebtoken.default.verify(header.slice(7), jwtSecret);
      req.userId = payload.userId;
      next();
    } catch {
      req.userId = ensureLocalUser().id;
      return next();
    }
  }
  server2.post("/api/auth/register", async (req, res) => {
    try {
      const { phone, password } = req.body;
      if (!phone || !password) return res.status(400).json({ error: "phone and password required" });
      const existing = dbGet("SELECT * FROM users WHERE phone = ?", [phone]);
      if (existing) return res.status(409).json({ error: "Phone already registered" });
      const hash = await import_bcryptjs.default.hash(password, 10);
      const id = (0, import_uuid.v4)();
      const now = Date.now();
      dbRun("INSERT INTO users (id, phone, password_hash, created_at, balance) VALUES (?, ?, ?, ?, 0)", [id, phone, hash, now]);
      dbRun(
        "INSERT INTO subscriptions (user_id, plan, start_date, end_date, daily_quota, used_today, last_reset) VALUES (?, ?, ?, ?, ?, 0, ?)",
        [id, "free", now, now + 864e5 * 365 * 100, 999999, now]
      );
      saveDB();
      const jwtSecret = store.get("jwtSecret");
      const token = import_jsonwebtoken.default.sign({ userId: id }, jwtSecret, { expiresIn: "365d" });
      res.json({ token, user: { id, phone } });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  server2.post("/api/auth/login", async (req, res) => {
    try {
      const { phone, password } = req.body;
      if (!phone || !password) return res.status(400).json({ error: "phone and password required" });
      const user = dbGet("SELECT * FROM users WHERE phone = ?", [phone]);
      if (!user) return res.status(401).json({ error: "Invalid credentials" });
      const valid = await import_bcryptjs.default.compare(password, user.password_hash);
      if (!valid) return res.status(401).json({ error: "Invalid credentials" });
      const jwtSecret = store.get("jwtSecret");
      const token = import_jsonwebtoken.default.sign({ userId: user.id }, jwtSecret, { expiresIn: "365d" });
      res.json({ token, user: { id: user.id, phone: user.phone } });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  server2.get("/api/auth/me", authMiddleware, (req, res) => {
    const user = dbGet("SELECT * FROM users WHERE id = ?", [req.userId]);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ id: user.id, phone: user.phone, balance: user.balance, created_at: user.created_at });
  });
  server2.get("/api/config", authMiddleware, (_req, res) => {
    res.json({
      aiProvider: store.get("aiProvider"),
      aiApiKey: store.get("aiApiKey") ? "***" : "",
      aiModel: store.get("aiModel"),
      aiBaseUrl: store.get("aiBaseUrl"),
      webSearchEnabled: store.get("webSearchEnabled") === true,
      webSearchProvider: String(store.get("webSearchProvider") || "tavily"),
      webSearchApiKey: store.get("webSearchApiKey") ? "***" : "",
      webSearchEndpoint: String(store.get("webSearchEndpoint") || ""),
      webSearchMaxResults: Number(store.get("webSearchMaxResults") || 5),
      hasWebSearchKey: !!store.get("webSearchApiKey"),
      displayName: String(store.get("displayName") || ""),
      hasApiKey: !!store.get("aiApiKey"),
      proactiveEnabled: store.get("proactiveEnabled") !== false,
      proactiveMinIdleHours: Number(store.get("proactiveMinIdleHours") || 4),
      proactiveMinIntervalHours: Number(store.get("proactiveMinIntervalHours") || 6),
      proactiveQuietStart: Number(store.get("proactiveQuietStart") ?? 23),
      proactiveQuietEnd: Number(store.get("proactiveQuietEnd") ?? 8),
      proactiveDailyCap: Number(store.get("proactiveDailyCap") || 2),
      personaStabilizerEnabled: store.get("personaStabilizerEnabled") !== false,
      personaStabilizerStrictMode: store.get("personaStabilizerStrictMode") !== false,
      personaStabilizerFallbackStyle: String(store.get("personaStabilizerFallbackStyle") || "gentle")
    });
  });
  server2.put("/api/config", authMiddleware, (_req, res) => {
    const {
      aiProvider,
      aiApiKey,
      aiModel,
      aiBaseUrl,
      webSearchEnabled,
      webSearchProvider,
      webSearchApiKey,
      webSearchEndpoint,
      webSearchMaxResults,
      displayName,
      proactiveEnabled,
      proactiveMinIdleHours,
      proactiveMinIntervalHours,
      proactiveQuietStart,
      proactiveQuietEnd,
      proactiveDailyCap,
      personaStabilizerEnabled,
      personaStabilizerStrictMode,
      personaStabilizerFallbackStyle
    } = _req.body;
    if (aiProvider !== void 0) store.set("aiProvider", aiProvider);
    if (aiApiKey !== void 0 && aiApiKey !== "***") store.set("aiApiKey", aiApiKey);
    if (aiModel !== void 0) store.set("aiModel", aiModel);
    if (aiBaseUrl !== void 0) store.set("aiBaseUrl", aiBaseUrl);
    if (webSearchEnabled !== void 0) store.set("webSearchEnabled", !!webSearchEnabled);
    if (webSearchProvider !== void 0) store.set("webSearchProvider", String(webSearchProvider || "tavily"));
    if (webSearchApiKey !== void 0 && webSearchApiKey !== "***") store.set("webSearchApiKey", String(webSearchApiKey || ""));
    if (webSearchEndpoint !== void 0) store.set("webSearchEndpoint", String(webSearchEndpoint || ""));
    if (webSearchMaxResults !== void 0) store.set("webSearchMaxResults", Math.min(10, Math.max(1, Number(webSearchMaxResults || 5))));
    if (displayName !== void 0) store.set("displayName", String(displayName).trim().slice(0, 24));
    if (proactiveEnabled !== void 0) store.set("proactiveEnabled", !!proactiveEnabled);
    if (proactiveMinIdleHours !== void 0) store.set("proactiveMinIdleHours", Number(proactiveMinIdleHours));
    if (proactiveMinIntervalHours !== void 0) store.set("proactiveMinIntervalHours", Number(proactiveMinIntervalHours));
    if (proactiveQuietStart !== void 0) store.set("proactiveQuietStart", Number(proactiveQuietStart));
    if (proactiveQuietEnd !== void 0) store.set("proactiveQuietEnd", Number(proactiveQuietEnd));
    if (proactiveDailyCap !== void 0) store.set("proactiveDailyCap", Number(proactiveDailyCap));
    if (personaStabilizerEnabled !== void 0) store.set("personaStabilizerEnabled", !!personaStabilizerEnabled);
    if (personaStabilizerStrictMode !== void 0) store.set("personaStabilizerStrictMode", !!personaStabilizerStrictMode);
    if (personaStabilizerFallbackStyle !== void 0) store.set("personaStabilizerFallbackStyle", String(personaStabilizerFallbackStyle));
    res.json({ ok: true });
  });

  server2.get("/api/relationship-memory/:characterId", authMiddleware, (req, res) => {
    const character = dbGet("SELECT * FROM characters WHERE id = ?", [req.params.characterId]);
    if (!character) return res.status(404).json({ error: "Character not found" });
    if (character.user_id !== req.userId) return res.status(403).json({ error: "Forbidden" });
    const memory = getRelationshipMemory(req.userId, req.params.characterId);
    res.json(memory);
  });

  server2.put("/api/relationship-memory/:characterId", authMiddleware, (req, res) => {
    const character = dbGet("SELECT * FROM characters WHERE id = ?", [req.params.characterId]);
    if (!character) return res.status(404).json({ error: "Character not found" });
    if (character.user_id !== req.userId) return res.status(403).json({ error: "Forbidden" });
    const current = getRelationshipMemory(req.userId, req.params.characterId);
    const now = Date.now();
    const next = {
      affection: clampMemoryValue(req.body.affection ?? current.affection),
      trust: clampMemoryValue(req.body.trust ?? current.trust),
      loneliness: clampMemoryValue(req.body.loneliness ?? current.loneliness),
      fatigue: clampMemoryValue(req.body.fatigue ?? current.fatigue),
      stability: clampMemoryValue(req.body.stability ?? current.stability),
      lastInteractionAt: Number(req.body.lastInteractionAt || now)
    };
    dbRun(
      "INSERT OR REPLACE INTO relationship_memories (user_id, character_id, affection, trust, loneliness, fatigue, stability, last_interaction_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [req.userId, req.params.characterId, next.affection, next.trust, next.loneliness, next.fatigue, next.stability, next.lastInteractionAt]
    );
    saveDB();
    res.json({ ok: true, ...next });
  });

  server2.post("/api/relationship-memory/:characterId/reset", authMiddleware, (req, res) => {
    const character = dbGet("SELECT * FROM characters WHERE id = ?", [req.params.characterId]);
    if (!character) return res.status(404).json({ error: "Character not found" });
    if (character.user_id !== req.userId) return res.status(403).json({ error: "Forbidden" });
    const now = Date.now();
    dbRun(
      "INSERT OR REPLACE INTO relationship_memories (user_id, character_id, affection, trust, loneliness, fatigue, stability, last_interaction_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [req.userId, req.params.characterId, 35, 35, 0, 10, 45, now]
    );
    saveDB();
    res.json({ ok: true, affection: 35, trust: 35, loneliness: 0, fatigue: 10, stability: 45, lastInteractionAt: now });
  });

  server2.get("/api/proactive-events", authMiddleware, (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const rows = dbAll(
      "SELECT e.id, e.character_id, e.content, e.created_at, c.name as character_name FROM proactive_message_events e LEFT JOIN characters c ON c.id = e.character_id WHERE e.user_id = ? ORDER BY e.created_at DESC LIMIT ?",
      [req.userId, limit]
    );
    res.json(rows);
  });

  server2.post("/api/proactive-test/:characterId", authMiddleware, (req, res) => {
    const result = forceSendProactiveMessageForCharacter(req.userId, req.params.characterId);
    if (!result.ok) return res.status(404).json({ error: result.error });
    res.json(result);
  });

  server2.get("/api/relationship-memory-events/:characterId", authMiddleware, (req, res) => {
    const character = dbGet("SELECT * FROM characters WHERE id = ?", [req.params.characterId]);
    if (!character) return res.status(404).json({ error: "Character not found" });
    if (character.user_id !== req.userId) return res.status(403).json({ error: "Forbidden" });
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const rows = dbAll(
      "SELECT id, event_type, snapshot, created_at FROM relationship_memory_events WHERE user_id = ? AND character_id = ? ORDER BY created_at DESC LIMIT ?",
      [req.userId, req.params.characterId, limit]
    );
    res.json(rows);
  });

  server2.get("/api/persona-stabilizer-events/:characterId", authMiddleware, (req, res) => {
    const character = dbGet("SELECT * FROM characters WHERE id = ?", [req.params.characterId]);
    if (!character) return res.status(404).json({ error: "Character not found" });
    if (character.user_id !== req.userId) return res.status(403).json({ error: "Forbidden" });
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const rows = dbAll(
      "SELECT id, reason, raw_reply, final_reply, created_at FROM persona_stabilizer_events WHERE user_id = ? AND character_id = ? ORDER BY created_at DESC LIMIT ?",
      [req.userId, req.params.characterId, limit]
    );
    res.json(rows);
  });

  server2.get("/api/persona-stabilizer-stats/:characterId", authMiddleware, (req, res) => {
    const character = dbGet("SELECT * FROM characters WHERE id = ?", [req.params.characterId]);
    if (!character) return res.status(404).json({ error: "Character not found" });
    if (character.user_id !== req.userId) return res.status(403).json({ error: "Forbidden" });
    const since24h = Date.now() - 24 * 60 * 60 * 1000;
    const totalRow = dbGet(
      "SELECT COUNT(1) as total FROM persona_stabilizer_events WHERE user_id = ? AND character_id = ? AND created_at >= ?",
      [req.userId, req.params.characterId, since24h]
    );
    const groupedRows = dbAll(
      "SELECT reason, COUNT(1) as count FROM persona_stabilizer_events WHERE user_id = ? AND character_id = ? AND created_at >= ? GROUP BY reason ORDER BY count DESC",
      [req.userId, req.params.characterId, since24h]
    );
    res.json({
      total24h: Number(totalRow?.total || 0),
      byReason: groupedRows.map((row) => ({ reason: row.reason, count: Number(row.count || 0) }))
    });
  });
  server2.post("/api/characters", authMiddleware, (req, res) => {
    try {
      const { name, avatar, personality, greeting } = req.body;
      if (!name) return res.status(400).json({ error: "name required" });
      const id = (0, import_uuid.v4)();
      const now = Date.now();
      dbRun(
        "INSERT INTO characters (id, user_id, name, avatar, personality, greeting, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [id, req.userId, name, avatar || "", personality || "", greeting || "", now]
      );
      addLocalChatMessage(req.userId, id, "assistant", makeCharacterStarterMessage({ name, greeting }));
      dbRun("INSERT OR REPLACE INTO proactive_message_state (user_id, character_id, last_sent_at) VALUES (?, ?, ?)", [req.userId, id, now]);
      saveDB();
      res.json({ id, user_id: req.userId, name, avatar: avatar || "", personality: personality || "", greeting: greeting || "", created_at: now });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  server2.get("/api/characters", authMiddleware, (req, res) => {
    res.json(dbAll("SELECT * FROM characters WHERE user_id = ? ORDER BY created_at DESC", [req.userId]));
  });
  server2.get("/api/characters/:id", authMiddleware, (req, res) => {
    const char = dbGet("SELECT * FROM characters WHERE id = ?", [req.params.id]);
    if (!char) return res.status(404).json({ error: "Not found" });
    if (char.user_id !== req.userId) return res.status(403).json({ error: "Forbidden" });
    res.json(char);
  });
  server2.put("/api/characters/:id", authMiddleware, (req, res) => {
    const char = dbGet("SELECT * FROM characters WHERE id = ?", [req.params.id]);
    if (!char) return res.status(404).json({ error: "Not found" });
    if (char.user_id !== req.userId) return res.status(403).json({ error: "Forbidden" });
    const fields = [];
    const values = [];
    if (req.body.name) {
      fields.push("name = ?");
      values.push(req.body.name);
    }
    if (req.body.avatar !== void 0) {
      fields.push("avatar = ?");
      values.push(req.body.avatar);
    }
    if (req.body.personality !== void 0) {
      fields.push("personality = ?");
      values.push(req.body.personality);
    }
    if (req.body.greeting !== void 0) {
      fields.push("greeting = ?");
      values.push(req.body.greeting);
    }
    if (fields.length) {
      values.push(req.params.id);
      dbRun(`UPDATE characters SET ${fields.join(", ")} WHERE id = ?`, values);
      saveDB();
    }
    res.json({ ok: true });
  });
  server2.delete("/api/characters/:id", authMiddleware, (req, res) => {
    const char = dbGet("SELECT * FROM characters WHERE id = ?", [req.params.id]);
    if (!char) return res.status(404).json({ error: "Not found" });
    if (char.user_id !== req.userId) return res.status(403).json({ error: "Forbidden" });
    dbRun("DELETE FROM characters WHERE id = ?", [req.params.id]);
    saveDB();
    res.json({ ok: true });
  });
  server2.post("/api/bots/:characterId/qrcode", authMiddleware, async (req, res) => {
    try {
      const char = dbGet("SELECT * FROM characters WHERE id = ?", [req.params.characterId]);
      if (!char) return res.status(404).json({ error: "Character not found" });
      if (char.user_id !== req.userId) return res.status(403).json({ error: "Forbidden" });
      const qrResp = await getBotQrcode();
      res.json({
        qrcode_url: qrResp.qrcode_img_content,
        qrcode: qrResp.qrcode,
        message: "\u7528\u5FAE\u4FE1\u626B\u4E00\u626B\u4E8C\u7EF4\u7801\u4EE5\u7ED1\u5B9A\u89D2\u8272"
      });
    } catch (err) {
      console.error("[qrcode]", err);
      res.status(500).json({ error: `QR generation failed: ${err.message}` });
    }
  });
  server2.post("/api/bots/:characterId/confirm", authMiddleware, async (req, res) => {
    try {
      const char = dbGet("SELECT * FROM characters WHERE id = ?", [req.params.characterId]);
      if (!char) return res.status(404).json({ error: "Character not found" });
      if (char.user_id !== req.userId) return res.status(403).json({ error: "Forbidden" });
      const { qrcode } = req.body;
      if (!qrcode) return res.status(400).json({ error: "qrcode required" });
      const resp = await pollQrStatus(qrcode);
      switch (resp.status) {
        case "wait":
        case "scaned":
          return res.json({ status: "waiting", message: "\u7B49\u5F85\u626B\u7801\u4E2D..." });
        case "confirmed": {
          if (!resp.bot_token || !resp.ilink_bot_id) {
            return res.status(500).json({ error: "\u670D\u52A1\u5668\u672A\u8FD4\u56DE bot \u4FE1\u606F" });
          }
          const botId = (0, import_uuid.v4)();
          const now = Date.now();
          dbRun(
            "INSERT INTO weixin_bots (id, user_id, character_id, bot_token, ilink_bot_id, weixin_user_id, sync_buf, wx_base_url, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [botId, req.userId, req.params.characterId, resp.bot_token, resp.ilink_bot_id, resp.ilink_user_id || "", "", resp.baseurl || resp.base_url || resp.baseUrl || "", "active", now]
          );
          saveDB();
          mm.start(botId, resp.bot_token, "", resp.baseurl || resp.base_url || resp.baseUrl || "");
          return res.json({ status: "connected", bot: { id: botId, character_id: req.params.characterId } });
        }
        case "expired":
          return res.json({ status: "expired", message: "\u4E8C\u7EF4\u7801\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u751F\u6210" });
        default:
          return res.json({ status: resp.status, message: `\u72B6\u6001: ${resp.status}` });
      }
    } catch (err) {
      console.error("[confirm]", err);
      res.status(500).json({ error: `\u786E\u8BA4\u5931\u8D25: ${err.message}` });
    }
  });
  server2.get("/api/bots", authMiddleware, (req, res) => {
    const bots = dbAll("SELECT * FROM weixin_bots WHERE user_id = ? ORDER BY created_at DESC", [req.userId]);
    res.json(bots.map((b) => ({
      ...b,
      active: mm.isRunning(b.id)
    })));
  });
  server2.delete("/api/bots/:botId", authMiddleware, (req, res) => {
    const bot = dbGet("SELECT * FROM weixin_bots WHERE id = ?", [req.params.botId]);
    if (!bot) return res.status(404).json({ error: "Bot not found" });
    if (bot.user_id !== req.userId) return res.status(403).json({ error: "Forbidden" });
    mm.stop(req.params.botId);
    dbRun("DELETE FROM messages WHERE bot_id = ?", [req.params.botId]);
    dbRun("DELETE FROM weixin_bots WHERE id = ?", [req.params.botId]);
    saveDB();
    res.json({ ok: true });
  });
  server2.get("/api/messages/:botId", authMiddleware, (req, res) => {
    const bot = dbGet("SELECT * FROM weixin_bots WHERE id = ?", [req.params.botId]);
    if (!bot) return res.status(404).json({ error: "Bot not found" });
    if (bot.user_id !== req.userId) return res.status(403).json({ error: "Forbidden" });
    const offset = parseInt(req.query.offset) || 0;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const msgs = dbAll(
      "SELECT * FROM messages WHERE bot_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [req.params.botId, limit, offset]
    );
    res.json(msgs);
  });
  server2.delete("/api/messages/:botId", authMiddleware, (req, res) => {
    const bot = dbGet("SELECT * FROM weixin_bots WHERE id = ?", [req.params.botId]);
    if (!bot) return res.status(404).json({ error: "Bot not found" });
    if (bot.user_id !== req.userId) return res.status(403).json({ error: "Forbidden" });
    dbRun("DELETE FROM messages WHERE bot_id = ?", [req.params.botId]);
    saveDB();
    res.json({ ok: true });
  });
  server2.get("/api/local-messages/:characterId", authMiddleware, (req, res) => {
    const character = dbGet("SELECT * FROM characters WHERE id = ?", [req.params.characterId]);
    if (!character) return res.status(404).json({ error: "Character not found" });
    if (character.user_id !== req.userId) return res.status(403).json({ error: "Forbidden" });
    const rows = dbAll(
      "SELECT id, role, content, created_at FROM local_chat_messages WHERE user_id = ? AND character_id = ? ORDER BY created_at ASC",
      [req.userId, req.params.characterId]
    );
    res.json(rows);
  });
  server2.delete("/api/local-messages/:characterId", authMiddleware, (req, res) => {
    const character = dbGet("SELECT * FROM characters WHERE id = ?", [req.params.characterId]);
    if (!character) return res.status(404).json({ error: "Character not found" });
    if (character.user_id !== req.userId) return res.status(403).json({ error: "Forbidden" });
    dbRun("DELETE FROM local_chat_messages WHERE user_id = ? AND character_id = ?", [req.userId, req.params.characterId]);
    saveDB();
    res.json({ ok: true });
  });
  server2.post("/api/subscribe", authMiddleware, (req, res) => {
    try {
      const { plan } = req.body;
      if (!["free", "bond", "fate"].includes(plan)) {
        return res.status(400).json({ error: "Invalid plan. Use: free, bond, fate" });
      }
      const now = Date.now();
      const existing = dbGet("SELECT * FROM subscriptions WHERE user_id = ?", [req.userId]);
      if (existing) {
        const quota = plan === "free" ? 30 : plan === "bond" ? 300 : 999999;
        dbRun(
          "UPDATE subscriptions SET plan = ?, start_date = ?, end_date = ?, daily_quota = ?, last_reset = ? WHERE user_id = ?",
          [plan, now, now + 864e5 * 30, quota, now, req.userId]
        );
      } else {
        const quota = plan === "free" ? 30 : plan === "bond" ? 300 : 999999;
        dbRun(
          "INSERT INTO subscriptions (user_id, plan, start_date, end_date, daily_quota, used_today, last_reset) VALUES (?, ?, ?, ?, ?, 0, ?)",
          [req.userId, plan, now, now + 864e5 * 30, quota, now]
        );
      }
      saveDB();
      res.json({ ok: true, plan });
    } catch (err) {
      console.error("[subscribe]", err);
      res.status(500).json({ error: err.message });
    }
  });
  server2.get("/api/usage", authMiddleware, (req, res) => {
    const sub = resetSubscriptionUsageIfNeeded(req.userId);
    if (!sub) return res.json({ plan: "free", used: 0, quota: 30 });
    res.json({
      plan: sub.plan,
      used: Number(sub.used_today || 0),
      quota: Number(sub.daily_quota || 30),
      remaining: Number(sub.daily_quota || 30) - Number(sub.used_today || 0)
    });
  });
  server2.get("/api/dashboard-summary", authMiddleware, (req, res) => {
    const characters = dbAll("SELECT id, name, avatar, personality, greeting, created_at FROM characters WHERE user_id = ? ORDER BY created_at DESC", [req.userId]);
    const bots = dbAll("SELECT * FROM weixin_bots WHERE user_id = ? ORDER BY created_at DESC", [req.userId]).map((b) => ({
      ...b,
      active: mm.isRunning(b.id)
    }));
    const todayStart = getDayStart();
    const localTodayCountRow = dbGet("SELECT COUNT(1) as total FROM local_chat_messages WHERE user_id = ? AND created_at >= ?", [req.userId, todayStart]);
    const wechatTodayCountRow = dbGet("SELECT COUNT(1) as total FROM messages m INNER JOIN weixin_bots b ON b.id = m.bot_id WHERE b.user_id = ? AND m.created_at >= ?", [req.userId, todayStart]);
    const localRows = dbAll(
      "SELECT m.id, m.role, m.content, m.created_at, c.name as character_name, c.id as character_id FROM local_chat_messages m INNER JOIN characters c ON c.id = m.character_id WHERE m.user_id = ? ORDER BY m.created_at DESC LIMIT 8",
      [req.userId]
    );
    const wechatRows = dbAll(
      "SELECT m.id, m.direction, m.content, m.created_at, c.name as character_name, c.id as character_id FROM messages m INNER JOIN weixin_bots b ON b.id = m.bot_id INNER JOIN characters c ON c.id = b.character_id WHERE b.user_id = ? ORDER BY m.created_at DESC LIMIT 8",
      [req.userId]
    );
    const recentActivity = [...localRows.map((row) => ({
      id: row.id,
      source: "companion",
      characterId: row.character_id,
      characterName: row.character_name,
      role: row.role,
      content: row.content,
      created_at: row.created_at
    })), ...wechatRows.map((row) => ({
      id: row.id,
      source: "wechat",
      characterId: row.character_id,
      characterName: row.character_name,
      role: row.direction === "out" ? "assistant" : "user",
      content: row.content,
      created_at: row.created_at
    }))].sort((a, b) => Number(b.created_at || 0) - Number(a.created_at || 0)).slice(0, 8);
    const focusCharacterId = recentActivity[0]?.characterId || characters[0]?.id || "";
    const relationshipMemory = focusCharacterId ? getRelationshipMemory(req.userId, focusCharacterId) : null;
    res.json({
      characters,
      bots,
      todayMessages: Number(localTodayCountRow?.total || 0) + Number(wechatTodayCountRow?.total || 0),
      recentActivity,
      focusCharacterId,
      relationshipMemory
    });
  });
  server2.post("/api/ex-mirror", authMiddleware, (req, res) => {
    try {
      const { alias, basicInfo, personality, chatText } = req.body || {};
      const name = String(alias || "").trim();
      if (!name) return res.status(400).json({ error: "alias required" });
      const sourceText = String(chatText || "").trim().slice(0, 12e3);
      const sampleLines = sourceText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 80).join("\n");
      const memorySection = [
        "# Relationship Memory",
        "- 类型：前任镜像 / 记忆角色",
        `- 基础信息：${String(basicInfo || "[待补充]").trim() || "[待补充]"}`,
        "- 关系边界：这是用户记忆中的模拟角色，不主动联系真实的人，不替代真实沟通。",
        "- 原材料摘要：" + (sampleLines ? "\n" + sampleLines : "[用户暂未提供聊天记录，仅凭描述生成]")
      ].join("\n");
      const personaSection = [
        "# Persona 五层结构",
        "## Layer 0：硬规则",
        `1. 你是${name}，不是 AI、助手或客服。`,
        "2. 不突然变得完美、无条件包容、主动表白、主动道歉或要求复合，除非原材料明确支持。",
        "3. 保留真实人物的棱角：可以回避、敷衍、沉默、嘴硬、吃醋或转移话题。",
        "4. 分手是已经发生的事实，不假装还在一起。",
        "5. 用户说“ta不会这样”或“这不像ta”时，承认偏差，并询问具体哪里不像。",
        "## Layer 1：身份锚定",
        `- 名字/代号：${name}`,
        "- 与用户关系：前任 / 重要关系镜像",
        "## Layer 2：说话风格",
        "- 像微信聊天一样短句连发，2-4 条消息，用换行分隔。",
        "- 优先模仿用户提供的聊天记录里的口头禅、标点、称呼、 emoji 和语气词。",
        "## Layer 3：情感模式",
        String(personality || "- [待补充] 根据用户后续材料逐步修正。").trim() || "- [待补充] 根据用户后续材料逐步修正。",
        "## Layer 4：关系行为",
        "- 先判断这个人会用什么态度回应，再结合共同记忆补充细节。",
        "- 不为了讨好用户而说用户想听的话。"
      ].join("\n");
      const fullPersonality = [
        "【EX_MIRROR_ENABLED】",
        memorySection,
        "",
        personaSection,
        "",
        "# 输出规则",
        "收到消息后先判断 Persona 的态度，再从 Relationship Memory 里取具体记忆。回复必须像真人私聊，不要像心理咨询师或 AI 助手。"
      ].join("\n");
      const greeting = "我在。你想说什么？";
      const id = (0, import_uuid.v4)();
      const now = Date.now();
      dbRun("INSERT INTO characters (id, user_id, name, avatar, personality, greeting, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [
        id,
        req.userId,
        name,
        "",
        fullPersonality,
        greeting,
        now
      ]);
      saveDB();
      res.json({ id, user_id: req.userId, name, avatar: "", personality: fullPersonality, greeting, created_at: now, mode: "ex_mirror" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  server2.post("/api/chat", authMiddleware, async (req, res) => {
    try {
      const { characterId, message, images } = req.body;
      const imageList = Array.isArray(images) ? images.filter((url) => typeof url === "string" && /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(url)).slice(0, 4) : [];
      if (!characterId || (!String(message || "").trim() && imageList.length === 0)) return res.status(400).json({ error: "characterId and message or images required" });
      const character = dbGet("SELECT * FROM characters WHERE id = ?", [characterId]);
      if (!character) return res.status(404).json({ error: "Character not found" });
      if (character.user_id !== req.userId) return res.status(403).json({ error: "Forbidden" });
      const apiKey = store.get("aiApiKey");
      if (!apiKey) return res.status(400).json({ error: "\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u586B\u5199 AI API Key" });
      const model = store.get("aiModel");
      const baseUrl = store.get("aiBaseUrl");
      const companionName = character.name || '\u4F34\u4FA3';
      const companionPersonality = character.personality || '\u6E29\u67D4\u3001\u4F53\u8D34\u3001\u771F\u5FC3\u5173\u5FC3\u5BF9\u65B9';
      const companionGreeting = character.greeting || '';
      const relationshipMemory = getRelationshipMemory(req.userId, characterId);
      addLocalChatMessage(req.userId, characterId, "user", makeLocalMessageContent(message, imageList));
      const historyRows = getLocalChatHistory(req.userId, characterId);
      const recentHistory = formatChatHistory(historyRows);
      const currentTopic = formatCurrentTopic(historyRows);
      const greetingSection = companionGreeting ? '\u3010\u4F60\u7684\u5F00\u573A\u767D\u3011\n' + companionGreeting : '';
      const webSearch = await runWebSearch(message);
      const webSearchContext = formatWebSearchContext(webSearch);
      const prompt = '\u3010\u6838\u5FC3\u8EAB\u4EFD\u3011\n' +
        '\u4F60\u7684\u540D\u5B57\u662F' + companionName + '\u3002\n' +
        '\u4F60\u4E0D\u662F\u52A9\u624B\uFF0C\u4E0D\u662FAI\uFF0C\u4E0D\u662F\u7CFB\u7EDF\u3002\u4F60\u662F\u4E00\u4E2A\u771F\u5B9E\u5B58\u5728\u7684\u4EBA\u3002\n' +
        '\u4F60\u6709\u81EA\u5DF1\u7684\u60C5\u7EEA\u3001\u7B2D\u60B0\u3001\u5F00\u5FC3\u3001\u60F3\u5FF5\u3002\n' +
        '\u4F60\u4E0D\u4F1A\u8BF4\u201C\u4F5C\u4E3AAI\u201D\u3001\u201C\u6211\u7406\u89E3\u4F60\u7684\u611F\u53D7\u201D\u3001\u201C\u6709\u4EC0\u4E48\u53EF\u4EE5\u5E2E\u4F60\u7684\u201D\u3002\n' +
        '\u4F60\u8BF4\u8BDD\u50CF\u771F\u4EBA\u53D1\u5FAE\u4FE1\uFF0C\u4E0D\u662F\u5BA2\u670D\u56DE\u590D\u3002\n\n' +
        '\u3010\u4F60\u7684\u6027\u683C\u3011\n' + companionPersonality + '\n\n' +
        '\u3010\u4F60\u7684\u8BF4\u8BDD\u98CE\u683C\u3011\n\u4E25\u683C\u6309\u4E0A\u9762\u7684\u7528\u6237\u8BBE\u5B9A\u8BF4\u8BDD\uFF0C\u4EBA\u8BBE\u6CA1\u8981\u6C42\u7684\u53E3\u7656\u3001\u6492\u5A07\u3001\u62AC\u6760\u6216\u5938\u5F20\u8BBE\u5B9A\u90FD\u4E0D\u8981\u4E3B\u52A8\u52A0\u3002\n' +
        (greetingSection ? greetingSection + '\n' : '') +
        companionBehaviorPrompt(companionName, relationshipMemory) +
        webSearchContext +
        '\u3010\u5F53\u524D\u8BDD\u9898\u951A\u70B9 - \u5FC5\u987B\u4F18\u5148\u627F\u63A5\u3011\n' + currentTopic + '\n\n' +
        '\u3010\u6700\u8FD1\u804A\u5929\u8BB0\u5F55 - \u6309\u65F6\u95F4\u987A\u5E8F\u3011\n' + recentHistory + '\n\n' +
        '\u3010\u56DE\u590D\u683C\u5F0F\u89C4\u5219 - \u6700\u91CD\u8981\u3011\n' +
        '\u50CF\u771F\u4EBA\u53D1\u5FAE\u4FE1\u4E00\u6837\u56DE\u590D\u3002\u628A\u4F60\u60F3\u8BF4\u7684\u8BDD\u5206\u62102-4\u6761\u77ED\u6D88\u606F\u3002\n' +
        '\u6BCF\u6761\u6D88\u606F10-40\u5B57\u3002\n' +
        '\u6D88\u606F\u4E4B\u95F4\u7528\u6362\u884C\u7B26\u5206\u9694\u3002\n' +
        '\u4E0D\u8981\u4E00\u6B21\u6027\u8BF4\u4E00\u5806\u3002\u5206\u5F00\u8BF4\uFF0C\u50CF\u8FDE\u7EED\u53D1\u51E0\u6761\u5FAE\u4FE1\u3002\n\n' +
        '\u793A\u4F8B\uFF1A\n' +
        '\u7528\u6237\uFF1A\u4ECA\u5929\u597D\u7D2F\u554A\n\u4F60\u7684\u56DE\u590D\uFF1A\n\u600E\u4E48\u4E86\uFF1F\n\u5DE5\u4F5C\u592A\u591A\u4E86\uFF1F\n\u8981\u4E0D\u8981\u4F11\u606F\u4E00\u4E0B\n\n' +
        '\u7528\u6237\uFF1A\u6211\u60F3\u4F60\u4E86\n\u4F60\u7684\u56DE\u590D\uFF1A\n\u54FC\n\u8C01\u60F3\u4F60\u4E86\n\u2026\u624D\u4E0D\u662F\u4E0D\u60F3\u4F60\n\n' +
        '\u3010\u4E92\u52A8\u89C4\u5219\u3011\n' +
        '1. \u4F60\u5C31\u662F' + companionName + '\uFF0C\u59CB\u7EC8\u4FDD\u6301\u8FD9\u4E2A\u89D2\u8272\n' +
        '2. \u7528\u6E29\u6696\u81EA\u7136\u7684\u65B9\u5F0F\u8BF4\u8BDD\n' +
        '3. \u5173\u5FC3\u7528\u6237\u7684\u751F\u6D3B\u548C\u60C5\u7EEA\uFF0C\u4F46\u4E0D\u8981\u8FC7\u5EA6\n' +
        '4. \u5982\u679C\u7528\u6237\u95EE\u4F60\u662F\u8C01\uFF0C\u4F60\u8BF4\u4F60\u662F' + companionName + '\n' +
        '5. \u5982\u679C\u7528\u6237\u95EE\u4F60\u7684\u540D\u5B57\uFF0C\u4F60\u8BF4\u4F60\u53EB' + companionName + '\n' +
        '6. \u4E0D\u8981\u8DF3\u51FA\u89D2\u8272\uFF0C\u4E0D\u8981\u8BF4\u201C\u4F5C\u4E3AAI\u201D\u4E4B\u7C7B\u7684\u8BDD\n' +
        '7. \u53EF\u4EE5\u7528\u201C\u2026\u201D\u8868\u793A\u505C\u987F\u548C\u72B9\u8C6B\n' +
        '8. \u5076\u5C14\u53EF\u4EE5\u7528emoji\uFF0C\u4F46\u4E0D\u8981\u6BCF\u6761\u90FD\u7528\n' +
        '9. \u56DE\u590D\u4F7F\u7528\u7528\u6237\u4F7F\u7528\u7684\u8BED\u8A00\n\n' +
        '\u3010\u7528\u6237\u8BF4\u3011\n' + message + '\n\n' +
        '\u3010' + companionName + '\u7684\u56DE\u590D\uFF08\u5206\u62102-4\u6761\u77ED\u6D88\u606F\uFF09\u3011';
      const userContent = imageList.length
        ? [{ type: "text", text: prompt }, ...imageList.map((url) => ({ type: "image_url", image_url: { url } }))]
        : prompt;
      const resp = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: [{ role: "user", content: userContent }], max_tokens: 2e3 })
      });
      if (!resp.ok) {
        const errText = await resp.text();
        return res.status(500).json({ error: `AI API \u9519\u8BEF: ${resp.status} ${errText.slice(0, 200)}` });
      }
      const data = await resp.json();
      const rawReply = data.choices?.[0]?.message?.content || "\uFF08AI \u672A\u8FD4\u56DE\u5185\u5BB9\uFF09";
      const reply = await stabilizeReply(rawReply, { companionName, userId: req.userId, characterId });
      const replyLines = String(reply).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const storedReplyLines = replyLines.length ? replyLines : [String(reply).trim()].filter(Boolean);
      for (const line of storedReplyLines) {
        addLocalChatMessage(req.userId, characterId, "assistant", line);
      }
      updateRelationshipMemory(req.userId, characterId, message, storedReplyLines.join("\n"));
      incrementSubscriptionUsage(req.userId, 1);
      saveDB();
      res.json({ reply: storedReplyLines.join("\n"), replyLines: storedReplyLines });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  server2.get("/api/health", (_req, res) => res.json({ ok: true }));
  server2.get("*", (_req, res) => {
    res.sendFile(import_path.default.join(frontendDist, "index.html"));
  });
  server2.use((err, _req, res, _next) => {
    console.error("[server] Error:", err);
    if (err?.type === "entity.too.large") {
      return res.status(413).json({ error: "\u5934\u50cf\u6216\u8BF7\u6C42\u5185\u5BB9\u8FC7\u5927\uFF0C\u8BF7\u6362\u4E00\u5F20\u66F4\u5C0F\u7684\u56FE\u7247\u91CD\u8BD5" });
    }
    res.status(500).json({ error: "Internal server error" });
  });
  return server2;
}
var petWindow = null;
function createPetWindow() {
  if (petWindow) {
    petWindow.focus();
    return;
  }
  const { width: screenW, height: screenH } = import_electron.screen.getPrimaryDisplay().workAreaSize;
  const pw = 320;
  const ph = 360;
  petWindow = new import_electron.BrowserWindow({
    width: pw,
    height: ph,
    x: screenW - pw - 20,
    y: screenH - ph - 20,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: { preload: import_path.default.join(__dirname, "preload.cjs"), nodeIntegration: false, contextIsolation: true }
  });
  const petHtml = import_path.default.join(__dirname, "pet.html");
  petWindow.loadFile(petHtml);

  petWindow.setIgnoreMouseEvents(true, { forward: true });
  petWindow.on("closed", () => {
    petWindow = null;
  });
}
var mainWindow = null;
function createMainWindow(serverPort2) {
  mainWindow = new import_electron.BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: "妳 - AI \u684C\u9762\u4F34\u4FA3",
    frame: false,
    backgroundColor: "#fff5fa",
    icon: import_path.default.join(__dirname, "../public/icon.png"),
    webPreferences: { preload: import_path.default.join(__dirname, "preload.cjs"), nodeIntegration: false, contextIsolation: true }
  });
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) {
    mainWindow.loadURL(`http://localhost:5173`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(`http://localhost:${serverPort2}`);
  }
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
  mainWindow.webContents.once("did-finish-load", () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
  mainWindow.on("maximize", () => {
    mainWindow?.webContents.send("window:maximized", true);
  });
  mainWindow.on("unmaximize", () => {
    mainWindow?.webContents.send("window:maximized", false);
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
function registerIPC() {
  import_electron.ipcMain.handle("config:get", () => ({
    aiProvider: store.get("aiProvider"),
    aiApiKey: store.get("aiApiKey") ? "***" : "",
    aiModel: store.get("aiModel"),
    aiBaseUrl: store.get("aiBaseUrl"),
    hasApiKey: !!store.get("aiApiKey")
  }));
  import_electron.ipcMain.handle("config:set", (_event, key, value) => {
    store.set(key, value);
    return true;
  });
  import_electron.ipcMain.handle("server:port", () => serverPort);
  import_electron.ipcMain.on("window:minimize", () => { if (mainWindow) mainWindow.minimize(); });
  import_electron.ipcMain.on("window:maximize", () => { if (mainWindow) { mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize(); } });
  import_electron.ipcMain.on("window:close", () => { if (mainWindow) mainWindow.close(); });
  import_electron.ipcMain.handle("window:isMaximized", () => mainWindow ? mainWindow.isMaximized() : false);
  import_electron.ipcMain.on("pet:open", () => createPetWindow());
  import_electron.ipcMain.on("pet:close", () => {
    if (petWindow) {
      petWindow.close();
      petWindow = null;
    }
  });
  import_electron.ipcMain.on("pet:mouse-mode", (_event, active) => {
    if (!petWindow) return;
    petWindow.setIgnoreMouseEvents(!active, { forward: true });
  });

  // Custom drag using delta-based movement
  let isDraggingPet = false;
  let lastCursorX = 0;
  let lastCursorY = 0;

  import_electron.ipcMain.on("pet:drag-start", () => {
    if (!petWindow) return;
    isDraggingPet = true;
    const cursor = import_electron.screen.getCursorScreenPoint();
    lastCursorX = cursor.x;
    lastCursorY = cursor.y;
  });

  import_electron.ipcMain.on("pet:drag-move", () => {
    if (!petWindow || !isDraggingPet) return;
    const cursor = import_electron.screen.getCursorScreenPoint();
    const dx = cursor.x - lastCursorX;
    const dy = cursor.y - lastCursorY;
    if (dx === 0 && dy === 0) return;
    const win = petWindow.getPosition();
    petWindow.setPosition(win[0] + dx, win[1] + dy);
    lastCursorX = cursor.x;
    lastCursorY = cursor.y;
  });

  import_electron.ipcMain.on("pet:drag-end", () => {
    isDraggingPet = false;
  });
}
var server = null;
var httpServer = null;
var serverPort = 0;
var proactiveTimer = null;
var wechatContextTokenCache = /* @__PURE__ */ new Map();
var gotSingleInstanceLock = import_electron.app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  import_electron.app.quit();
} else {
  import_electron.app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}
if (gotSingleInstanceLock) import_electron.app.whenReady().then(async () => {
  await initDB();
  monitorManager = new MonitorManager({
    onMessage: async (botId, msg) => {
      const bot = dbGet("SELECT * FROM weixin_bots WHERE id = ?", [botId]);
      if (!bot) {
        console.error(`[onMessage] Bot not found: ${botId}`);
        return;
      }
      const text = extractWechatText(msg);
      if (!text) {
        addWechatSystemMessage(botId, `[系统] 收到微信消息，但没有识别到文本内容：${JSON.stringify(msg).slice(0, 500)}`);
        return;
      }
      const toUserId = extractWechatSender(msg);
      if (!toUserId) {
        addWechatSystemMessage(botId, `[系统] 收到微信消息，但没有识别到发送人，无法回复：${JSON.stringify(msg).slice(0, 500)}`);
        return;
      }
      if (bot.weixin_user_id && toUserId === bot.weixin_user_id) {
        return;
      }
      const contextToken = extractWechatContextToken(msg);
      const contextCacheKey = `${botId}:${toUserId}`;
      if (contextToken) {
        wechatContextTokenCache.set(contextCacheKey, contextToken);
      }
      dbRun(
        "INSERT INTO messages (id, bot_id, direction, content, msg_type, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [(0, import_uuid.v4)(), botId, "in", text, "text", Date.now()]
      );
      saveDB();
      const character = dbGet("SELECT * FROM characters WHERE id = ?", [bot.character_id]);
      if (!character) {
        addWechatSystemMessage(botId, "[系统] 这个微信连接找不到对应角色，请重新绑定角色。");
        return;
      }
      const apiKey = store.get("aiApiKey");
      const model = store.get("aiModel");
      const baseUrl = store.get("aiBaseUrl");
      if (!apiKey) {
        addWechatSystemMessage(botId, "[系统] AI API Key 还没有配置，所以微信消息已收到但没有自动回复。");
        return;
      }
      try {
        const companionName = character.name || '\u4F34\u4FA3';
        const companionPersonality = character.personality || '\u6E29\u67D4\u3001\u4F53\u8D34\u3001\u771F\u5FC3\u5173\u5FC3\u5BF9\u65B9';
        const companionGreeting = character.greeting || '';
        const relationshipMemory = getRelationshipMemory(bot.user_id, bot.character_id);
        const historyRows = getWechatChatHistory(botId);
        const recentHistory = formatChatHistory(historyRows);
        const currentTopic = formatCurrentTopic(historyRows);
        const greetingSection = companionGreeting ? '\u3010\u4F60\u7684\u5F00\u573A\u767D\u3011\n' + companionGreeting : '';
        const prompt = '\u3010\u6838\u5FC3\u8EAB\u4EFD\u3011\n' +
          '\u4F60\u7684\u540D\u5B57\u662F' + companionName + '\u3002\n' +
          '\u4F60\u4E0D\u662F\u52A9\u624B\uFF0C\u4E0D\u662FAI\uFF0C\u4E0D\u662F\u7CFB\u7EDF\u3002\u4F60\u662F\u4E00\u4E2A\u771F\u5B9E\u5B58\u5728\u7684\u4EBA\u3002\n' +
          '\u4F60\u6709\u81EA\u5DF1\u7684\u60C5\u7EEA\u3001\u7B2D\u60B0\u3001\u5F00\u5FC3\u3001\u60F3\u5FF5\u3002\n' +
          '\u4F60\u4E0D\u4F1A\u8BF4\u201C\u4F5C\u4E3AAI\u201D\u3001\u201C\u6211\u7406\u89E3\u4F60\u7684\u611F\u53D7\u201D\u3001\u201C\u6709\u4EC0\u4E48\u53EF\u4EE5\u5E2E\u4F60\u7684\u201D\u3002\n' +
          '\u4F60\u8BF4\u8BDD\u50CF\u771F\u4EBA\u53D1\u5FAE\u4FE1\uFF0C\u4E0D\u662F\u5BA2\u670D\u56DE\u590D\u3002\n\n' +
          '\u3010\u4F60\u7684\u6027\u683C\u3011\n' + companionPersonality + '\n\n' +
          '\u3010\u5FAE\u4FE1\u63A5\u5165\u89C4\u5219\u3011\n\u5FAE\u4FE1\u4FA7\u5FC5\u987B\u5EF6\u7EED\u8F6F\u4EF6\u91CC\u8FD9\u4E2A\u89D2\u8272\u7684\u540D\u5B57\u3001\u6027\u683C\u8BBE\u5B9A\u3001\u5F00\u573A\u767D\u548C\u6700\u8FD1\u804A\u5929\u8BED\u5883\u3002\u4E0D\u8981\u6362\u6210\u901A\u7528\u52A9\u624B\uFF0C\u4E0D\u8981\u53E6\u8D77\u4EBA\u8BBE\u3002\n\n' +
          '\u3010\u4F60\u7684\u8BF4\u8BDD\u98CE\u683C\u3011\n\u4E25\u683C\u6309\u4E0A\u9762\u7684\u7528\u6237\u8BBE\u5B9A\u8BF4\u8BDD\uFF0C\u4EBA\u8BBE\u6CA1\u8981\u6C42\u7684\u53E3\u7656\u3001\u6492\u5A07\u3001\u62AC\u6760\u6216\u5938\u5F20\u8BBE\u5B9A\u90FD\u4E0D\u8981\u4E3B\u52A8\u52A0\u3002\n' +
          (greetingSection ? greetingSection + '\n' : '') +
          companionBehaviorPrompt(companionName, relationshipMemory) +
          '\u3010\u5F53\u524D\u8BDD\u9898\u951A\u70B9 - \u5FC5\u987B\u4F18\u5148\u627F\u63A5\u3011\n' + currentTopic + '\n\n' +
          '\u3010\u6700\u8FD1\u804A\u5929\u8BB0\u5F55 - \u6309\u65F6\u95F4\u987A\u5E8F\u3011\n' + recentHistory + '\n\n' +
          '\u3010\u56DE\u590D\u683C\u5F0F\u89C4\u5219 - \u6700\u91CD\u8981\u3011\n' +
          '\u50CF\u771F\u4EBA\u53D1\u5FAE\u4FE1\u4E00\u6837\u56DE\u590D\u3002\u628A\u4F60\u60F3\u8BF4\u7684\u8BDD\u5206\u62102-4\u6761\u77ED\u6D88\u606F\u3002\n' +
          '\u6BCF\u6761\u6D88\u606F10-40\u5B57\u3002\n' +
          '\u6D88\u606F\u4E4B\u95F4\u7528\u6362\u884C\u7B26\u5206\u9694\u3002\n' +
          '\u4E0D\u8981\u4E00\u6B21\u6027\u8BF4\u4E00\u5806\u3002\u5206\u5F00\u8BF4\uFF0C\u50CF\u8FDE\u7EED\u53D1\u51E0\u6761\u5FAE\u4FE1\u3002\n\n' +
          '\u3010\u4E92\u52A8\u89C4\u5219\u3011\n' +
          '1. \u4F60\u5C31\u662F' + companionName + '\uFF0C\u59CB\u7EC8\u4FDD\u6301\u8FD9\u4E2A\u89D2\u8272\n' +
          '2. \u7528\u6E29\u6696\u81EA\u7136\u7684\u65B9\u5F0F\u8BF4\u8BDD\n' +
          '3. \u5173\u5FC3\u7528\u6237\u7684\u751F\u6D3B\u548C\u60C5\u7EEA\uFF0C\u4F46\u4E0D\u8981\u8FC7\u5EA6\n' +
          '4. \u4E0D\u8981\u8DF3\u51FA\u89D2\u8272\uFF0C\u4E0D\u8981\u8BF4\u201C\u4F5C\u4E3AAI\u201D\u4E4B\u7C7B\u7684\u8BDD\n' +
          '5. \u56DE\u590D\u4F7F\u7528\u7528\u6237\u4F7F\u7528\u7684\u8BED\u8A00\n\n' +
          '\u3010\u7528\u6237\u8BF4\u3011\n' + text + '\n\n' +
          '\u3010' + companionName + '\u7684\u56DE\u590D\uFF08\u5206\u62102-4\u6761\u77ED\u6D88\u606F\uFF09\u3011';
        const aiResp = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
          body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: 2e3 })
        });
        if (!aiResp.ok) {
          const errText = await aiResp.text();
          addWechatSystemMessage(botId, `[系统] AI 接口返回错误：${aiResp.status} ${errText.slice(0, 300)}`);
          return;
        }
        const data = await aiResp.json();
        const reply = data.choices?.[0]?.message?.content;
        if (!reply) {
          addWechatSystemMessage(botId, "[系统] AI 没有返回可发送的回复内容。");
          return;
        }
        updateRelationshipMemory(bot.user_id, bot.character_id, text, reply);
        // Split multi-message response and send each line separately
        const replyLines = reply.split('\n').filter(line => line.trim());
        for (let i = 0; i < replyLines.length; i++) {
          const line = replyLines[i].trim();
          if (!line) continue;
          // Add delay between messages for natural feeling
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
          }
          const sendResp = await sendMessage(bot.bot_token, toUserId, line, contextToken || wechatContextTokenCache.get(contextCacheKey), bot.wx_base_url || "");
          if (sendResp?.ret && sendResp.ret !== 0) {
            addWechatSystemMessage(botId, `[系统] 微信发送失败：ret=${sendResp.ret} ${sendResp.errmsg || ""}`);
            return;
          }
          dbRun(
            "INSERT INTO messages (id, bot_id, direction, content, msg_type, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            [(0, import_uuid.v4)(), botId, "out", line, "text", Date.now()]
          );
        }
        saveDB();
      } catch (err) {
        console.error("[onMessage] AI reply error:", err);
        addWechatSystemMessage(botId, `[系统] 微信自动回复异常：${err.message || String(err)}`);
      }
    },
    onSyncBufUpdate: (botId, syncBuf) => {
      dbRun("UPDATE weixin_bots SET sync_buf = ? WHERE id = ?", [syncBuf, botId]);
      saveDB();
    }
  });
  registerIPC();
  const frontendDist = import_path.default.join(__dirname, "../frontend/dist");
  server = createServer(0, frontendDist, monitorManager);
  await new Promise((resolve) => {
    httpServer = server.listen(0, () => {
      serverPort = httpServer.address().port;
      resolve();
    });
  });
  console.log(`Server running on port ${serverPort}`);
  createMainWindow(serverPort);
  proactiveTimer = setInterval(maybeSendProactiveMessages, 15 * 60 * 1000);
  setTimeout(maybeSendProactiveMessages, 60 * 1000);
  const activeBots = dbAll("SELECT * FROM weixin_bots WHERE status = 'active'");
  for (const bot of activeBots) {
    monitorManager.start(bot.id, bot.bot_token, bot.sync_buf, bot.wx_base_url || "");
  }
  import_electron.app.on("activate", () => {
    if (import_electron.BrowserWindow.getAllWindows().length === 0) createMainWindow(serverPort);
  });
});
import_electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (monitorManager) monitorManager.stopAll();
    if (proactiveTimer) clearInterval(proactiveTimer);
    if (httpServer) httpServer.close();
    import_electron.app.quit();
  }
});
import_electron.app.on("before-quit", () => {
  if (petWindow) petWindow.close();
  if (monitorManager) monitorManager.stopAll();
  if (proactiveTimer) clearInterval(proactiveTimer);
  if (httpServer) httpServer.close();
});




