import View from './Views';
import icons from 'url:../../img/icons.svg';

class addRecipeView extends View {
  _parentElement = document.querySelector('.upload');
  _message = 'Recipe was successfully uploaded';
  _window = document.querySelector('.add-recipe-window');
  _overlay = document.querySelector('.overlay');
  _btnOpen = document.querySelector('.nav__btn--add-recipe');
  _btnClose = document.querySelector('.btn--close-modal');

  constructor() {
    super();
    this._addHandlerShowWindow();
    this._addHandlerHideWindow();
  }

  toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');
  }

  // function will be called as soon as the page loads
  _addHandlerShowWindow() {
    // we need to bind this to point to current object and not button on which Listener is attached to
    this._btnOpen.addEventListener('click', this.toggleWindow.bind(this));
  }

  // closing modal on X and overlay
  _addHandlerHideWindow() {
    this._btnClose.addEventListener('click', this.toggleWindow.bind(this));
    this._overlay.addEventListener('click', this.toggleWindow.bind(this));
  }

  // getting data from the form in modal
  addHandlerUpload(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      // FormData() constructor we pass in element that is a form, "this" points to the _parentElement which is the form
      const dataArr = [...new FormData(this)]; // array with all fields and values
      const data = Object.fromEntries(dataArr); // to get OBJECT
      handler(data);
    });
  }

  _generateMarkup() {}
}

export default new addRecipeView();
