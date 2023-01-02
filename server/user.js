class User {
  constructor(Username, password) {
    this.Username = Username;
    this.password = password;
    this.itemlist=[];
  }
  get Username() {
    return this.Username;
  }
  get password() {
    return this.password;
  }
  set Username(Username) {
    this.Username = Username;
  }
  set password(password) {
    this.password = password;
  }
  //
  // set additemlist(itemtitle,cost,quantity) {
  //   var tempar = [itemtitle,cost,quantity]
  //   this.itemlist = this.itemlist.concat(tempar);
  // }
  //
  // set removeitemlist(itemcode) {
  //   var tempar = this.itemlist.length
  //   for (var i = 0; i < tempar; i++) {
  //     if (tempar[i] === item) {
  //       tempar.splice(i, 1);
  //     }
  //   }
  //   this._itemlist=tempar;
  // }
  // get itemlist() {
  //   return this.itemlist;
  // }
  //
  // get totalcost(){
  //
  // }
}

module.exports = User;
