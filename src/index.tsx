import React from "react";
import ReactDOM from "react-dom/client";
import { getSnapshot } from "mobx-state-tree";
import SelectorStore, { ElementType } from "./store";
import { observer } from "mobx-react-lite";

const raw = [
  {
    li: "LogPoint",
    li_ip: "127.0.0.1",
    repos: [
      {
        repo: "default",
        address: "127.0.0.1:5504/default",
        ha: "",
        active: true
      },
      {
        repo: "_logpoint",
        address: "127.0.0.1:5504/_logpoint",
        ha: "",
        active: true
      },
      {
        repo: "_LogPointAlerts",
        address: "127.0.0.1:5504/_LogPointAlerts",
        ha: "",
        active: true
      },
      {
        repo: "uebaoutput",
        address: "127.0.0.1:5504/uebaoutput",
        ha: "",
        active: true
      }
    ],
    active: true
  }

  // {
  //   li: "LogPoint 002",
  //   li_ip: "127.0.0.10",
  //   repos: [
  //     {
  //       repo: "default",
  //       address: "127.0.0.1:5504/default",
  //       ha: "",
  //       active: true
  //     },
  //     {
  //       repo: "_logpoint",
  //       address: "127.0.0.1:5504/_logpoint",
  //       ha: "",
  //       active: true
  //     }
  //   ],
  //   active: true
  // }
];

const element = {
  raw: { name: "Niraj" },
  selected: ["001"],
  title: "Logpoint",
  uuid: "001",
  status: "selected"
};

// const _data = Element.create(element);
const _dataStore: ElementType = SelectorStore.create({
  raw,
  groups: []
});

console.log("--> lpGroup", _dataStore.lpGroup);
console.log("--> repoGroup", _dataStore.repoGroups);

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);
_dataStore.setSelected();

const App2 = observer(() => {
  const toggleData = (state: any) => {
    _dataStore.setMode(state);
    return _dataStore.setGroup(
      state == "lp" ? _dataStore.lpGroup : _dataStore.repoGroups
    );
  };

  return (
    <div>
      <div>
        <span onClick={() => toggleData("lp")}>Group by Logpoint</span> -------
        || -------
        <span onClick={() => toggleData("repo")}>Group by Repo</span>
      </div>

      {_dataStore.groups.map((item) => {
        return (
          <div
            style={{
              lineHeight: "30px",
              width: "300px",
              background: "#DDD",
              marginBottom: "1px",
              padding: "5px",
              display: "flex",
              justifyContent: "space-between"
            }}
          >
            <div width="30%">{item.title}:</div>
            <div
              style={{
                cursor: "pointer",
                background: "#333",
                color: "#fff",
                width: "70%",
                textAlign: "center"
              }}
            >
              <div
                onClick={() => {
                  item.toggle();
                  _dataStore.markSelected(item);
                }}
              >
                {item.status ? "true" : "false"}
              </div>
              <ul
                style={{
                  lineHeight: "30px",
                  width: "300px",
                  background: "#DDD",
                  marginBottom: "1px",
                  padding: "5px"
                }}
              >
                {item.children.map((sub_item: any) => {
                  return (
                    <li>
                      {sub_item.title}::{" "}
                      <b
                        style={{ color: "olive" }}
                        onClick={() => {
                          sub_item.toggle();
                          _dataStore.markSelected(sub_item);
                        }}
                      >
                        {sub_item.status ? "true" : "false"}
                      </b>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
});

root.render(
  <React.StrictMode>
    <App2 />
  </React.StrictMode>
);
