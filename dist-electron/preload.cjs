"use strict";
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("electronAPI", {
  getConfig: () => import_electron.ipcRenderer.invoke("config:get"),
  setConfig: (key, value) => import_electron.ipcRenderer.invoke("config:set", key, value),
  getServerPort: () => import_electron.ipcRenderer.invoke("server:port"),
  setPetMouseMode: (active) => import_electron.ipcRenderer.send("pet:mouse-mode", active),
  petDragStart: () => import_electron.ipcRenderer.send("pet:drag-start"),
  petDragMove: () => import_electron.ipcRenderer.send("pet:drag-move"),
  petDragEnd: () => import_electron.ipcRenderer.send("pet:drag-end"),
  onServerUrl: (callback) => {
    import_electron.ipcRenderer.on("server:url", (_event, url) => callback(url));
  },
  openPet: () => import_electron.ipcRenderer.send("pet:open"),
  closePet: () => import_electron.ipcRenderer.send("pet:close"),
  minimizeWindow: () => import_electron.ipcRenderer.send("window:minimize"),
  maximizeWindow: () => import_electron.ipcRenderer.send("window:maximize"),
  closeWindow: () => import_electron.ipcRenderer.send("window:close"),
  isMaximized: () => import_electron.ipcRenderer.invoke("window:isMaximized"),
  onMaximizeChange: (callback) => { import_electron.ipcRenderer.on("window:maximized", (_event, isMax) => callback(isMax)); },
});
