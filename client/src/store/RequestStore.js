import { makeAutoObservable } from "mobx";

export default class RequestStore {
  constructor(props) {
    this._states = [
      {
        id: 1,
        name: "В работе",
        state: "Queued",
        link: "queued",
        btn: "btn-warning",
      },
      {
        id: 2,
        name: "Выполнено",
        state: "Serviced",
        link: "serviced",
        btn: "btn-success",
      },
      {
        id: 3,
        name: "Отменено",
        state: "Canceled",
        link: "canceled",
        btn: "btn-danger",
      },
    ];
    this._requests = [];
    this._selectedState = "Queued";
    this._selectedPatient = "";
    makeAutoObservable(this);
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
}
