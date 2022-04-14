import icons from 'url:../../img/icons.svg';

// exporting class iteslf, coz we are not going to make an instnace, going to use it as a parent class of other views
export default class View {
  _data;

  // method for putting html on the page
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();

    this._data = data;
    const markup = this._generateMarkup();

    if (!render) return markup;

    this._clear();
    // attach html to parent element (.this._data), as a  first child (afterbegin)
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // here we create new markup but not render it, compare new html with old html and change whats changed
  update(data) {
    this._data = data;

    //  need to convert this string to DOM object that is living in the memory
    const newMarkup = this._generateMarkup();

    // converts string into real DOM objects
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    // returns a NODE LIST, so we convert it to array
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));

    // looping through both arrays in same time

    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      // isEqualNode() compares content of two arrays
      // console.log(curEl, newEl.isEqualNode(curEl));

      // Updates changed text
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        curEl.textContent = newEl.textContent;
      }

      // updates changed attributes
      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach(att =>
          curEl.setAttribute(att.name, att.value)
        );
      }
    });
  }

  _clear() {
    this._parentElement.innerHTML = '';
  }

  // 4️⃣ making a spinner
  renderSpinner() {
    const markup = `
    <div class="spinner">
      <svg>
        <use href="${icons}#icon-loader"></use>
      </svg>
    </div>
  `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderError(message = this._errorMessage) {
    const markup = `
    <div class="error">
      <div>
        <svg>
          <use href="${icons}#icon-alert-triangle"></use>
        </svg>
      </div>
      <p>${message}</p>
    </div>
    `;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderMessage(message = this._message) {
    const markup = `
    <div class="message">
      <div>
        <svg>
          <use href="${icons}#icon-smile"></use>
        </svg>
      </div>
      <p>${message}</p>
    </div>
    `;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
