import { makeAutoObservable } from "mobx";

export default class RequestStore {
  constructor(props) {
    this._states = [
      { id: 1, name: "В работе", state: "Queued", link: "queued" },
      { id: 2, name: "Выполнено", state: "Serviced", link: "serviced" },
      { id: 3, name: "Отменено", state: "Canceled", link: "canceled" },
    ];
    this._requests = [];

    this._selectedState = "Queued";
    makeAutoObservable(this);
  }

  setRequests(requests) {
    this._requests = requests;
  }
  setSelectedState(state) {
    this._selectedState = state;
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
}
