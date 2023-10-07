import { makeAutoObservable } from "mobx";

export default class RequestStore {
  constructor(props) {
    this._states = [
      {
        id: 1,
        name: "В работе",
        state: "Queued",
        btn: "btn-warning",
      },
      {
        id: 2,
        name: "Выполнено",
        state: "Serviced",
        btn: "btn-success",
      },
      {
        id: 3,
        name: "Отменено",
        state: "Canceled",
        btn: "btn-danger",
      },
    ];
    this._requests = [];
    this._selectedState = "Queued";
    this._selectedPatient = "";
    makeAutoObservable(this, {}, { autoBind: true });
  }

  setRequests(requests) {
    this._requests = requests;
  }
  setSelectedState(state) {
    this._selectedState = state;
  }

  setSelectedPatient(id) {
    this._selectedState = id;
  }
  get states() {
    return this._states;
  }
  get getRequests() {
    return this._requests;
  }
  get selectedState() {
    return this._selectedState;
  }
  get selectedPatient() {
    return this._selectedPatient;
  }
  get requestsWithSelectedState() {
    return this._requests.filter((el) => {
      if (el["EvnDirectionStatus_SysNick"] === "DirNew") {
        return true;
      }
      return el["EvnDirectionStatus_SysNick"] === this._selectedState;
    });
  }
  get requestsLengthWithDiffStates() {
    const length = {};
    for (let state of this._states) {
      length[state.state] = this._requests.filter((el) => {
        if (
          el["EvnDirectionStatus_SysNick"] === "DirNew" &&
          state.state === "Queued"
        ) {
          return true;
        }
        return el["EvnDirectionStatus_SysNick"] === state.state;
      }).length;
    }
    return length;
  }
  get combinedRequestsByStateAndId() {
    const arrCopy = Array.from(this.getRequests);
    arrCopy.filter(
      (el) => el["EvnDirectionStatus_SysNick"] === this.selectedState,
    );
    const result = [];
    while (arrCopy.length) {
      let p = arrCopy.shift(0);
      p["LpuSectionProfile_Name"] = Array.of(p["LpuSectionProfile_Name"]);
      p["Diag_FullName"] = Array.of(p["Diag_FullName"]);
      for (let i = 0; i < arrCopy.length; i++) {
        if (arrCopy[i]["Person_id"] === p["Person_id"]) {
          const del = arrCopy.splice(i, 1)[0];
          p["LpuSectionProfile_Name"].push(del["LpuSectionProfile_Name"]);
          if (!p["Diag_FullName"].includes(del["Diag_FullName"])) {
            p["Diag_FullName"].push(del["Diag_FullName"]);
          }
          i--;
        }
      }
      result.push(p);
    }
    return result;
  }
}
