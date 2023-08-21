import { types, Instance, getParent, hasParent } from "mobx-state-tree";

const Element: any = types
  .model({
    selected: types.optional(types.array(types.string), []),
    title: "",
    uuid: "",
    status: false,
    children: types.optional(types.array(types.late(() => Element)), [])
  })
  .actions((self: any) => {
    return {
      toggle() {
        self.status = !self.status;
        self.updateChildStatus();
      },

      updateChildStatus() {
        self.children.forEach((item: any) => {
          item.toggle();
        });
      },
      getParent() {
        if (hasParent(self)) {
          return getParent(getParent(self));
        }
      }
    };
  });

const Repos = types.model({
  repo: "",
  address: "",
  ha: "",
  active: types.boolean
});

const Raw = types.model({
  li: "",
  li_ip: "",
  repos: types.optional(types.array(Repos), [])
});

const SelectorStore = types
  .model({
    raw: types.optional(types.array(Raw), []),
    groups: types.optional(types.array(Element), []),
    selected: types.frozen({}),
    mode: ""
  })
  .views((self: any) => ({
    get isRepoMode() {
      return self.mode === "repo";
    },
    getRepos() {
      return self.raw.map((item: any) => item?.repos).flat();
    },
    getStatus(item: any, state: string = "lp", parent: any) {
      console.log("item --", item, self.selected);
      let current: any = self.selected[item?.repo];
      console.log("current ", current);
      if (state === "repo") {
        console.log("while repo", item, parent);
        current = self.selected[parent?.li];

        if (current) {
          console.log("->> satus", item?.repo, current[item?.repo]);
          return current[item?.repo];
        }
      } else if (state === "lp") {
        console.log("--> white lp", item);
        current = self.selected[item.li];
        console.log("-->> current", current, parent?.repo);
        if (current) {
          return current[parent?.repo];
        }
      }

      return false;
    },
    get lpGroup() {
      return self.raw.map((item: any) => {
        return {
          uuid: item.li_ip,
          title: item.li,
          // status: self.getStatus(item.li) || item.active,
          status: self.getStatus(item, "lp"),
          children: item.repos
            .map((sub_item: any) => {
              return {
                uuid: sub_item.address,
                title: sub_item.repo,
                // status: self.getStatus(sub_item.repo) || sub_item.active
                status: self.getStatus(sub_item, "repo", item)
              };
            })
            .filter((sub_item: any) => {
              return sub_item !== null;
            })
        };
      });
    },

    get repoGroups() {
      return Array.from(self.getRepos()).map((rep: any) => {
        return {
          uuid: rep.address,
          title: rep.repo,
          // status: self.getStatus(rep.li) || rep.active,
          status: self.getStatus(rep.li, "repo"),

          children: self.raw
            .map((lp: any) => {
              const _lp: any = lp.repos.find((_repo: any) => {
                return _repo.repo === rep.repo;
              })
                ? lp
                : null;
              if (!_lp) return null;
              return {
                uuid: _lp?.li_ip,
                title: _lp?.li,
                // status: self.getStatus(_lp.repo) || _lp.active
                status: self.getStatus(_lp, "lp", rep)
              };
            })
            .filter((sub_item: any) => {
              return sub_item !== null;
            })
        };
      });
    }
  }))
  .actions((self: any) => {
    return {
      setSelected() {
        // will trigger error
        const aa: any = {};
        self.raw.forEach((lp: any) => {
          var bb: any = {};
          aa[lp.li] = bb;
          lp.repos.forEach((repo: any) => {
            bb[repo.repo] = repo.active;
          });
        });
        self.selected = aa;
      },
      setMode(_mode: string) {
        self.mode = _mode;
      },
      markSelected(item: any) {
        let parent = item.getParent();
        if (self.isRepoMode) {
          let current = self.selected[item.title];
          const status = item.status;

          if (!!current) {
            current = {
              ...current,
              [parent.title]: status
            };
            self.selected = {
              ...self.selected,
              [item.title]: { ...current }
            };
          } else {
            current = {
              ...current,
              [parent.title]: status
            };
            self.selected = {
              ...self.selected,
              [item.title]: { [parent.title]: status }
            };
          }
        } else {
          const parent = item.getParent();
          let current = self.selected[parent.title];
          if (!current) {
            self.selected = {
              ...self.selected,
              [parent.title]: {}
            };
          }
          current = {
            ...current,
            [item.title]: item.status
          };
          self.selected = {
            ...self.selected,
            [parent.title]: { ...current }
          };
        }
        console.log("-->>>> selected", self.selected);
      },

      setGroup(_groups: any) {
        self.groups = [];
        self.groups = _groups;
      }
    };
  });

export interface ElementType extends Instance<typeof SelectorStore> {}

export default SelectorStore;
