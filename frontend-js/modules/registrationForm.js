export default class RegistrationForm {
    constructor() {
        this.allFields = document.querySelectorAll('#registration-form .form-control');
        this.insertValidationElements();
        this.username = document.querySelector('#username-register');
        this.username.previousValue = "";
        // this.email = document.querySelector('#email-register');
        this.events();
    }

    events() {
        this.username.addEventListener('keyup', () => {
            this.isDifferent(this.username, this.usernameHandler);
        });
    }

    //methods
    isDifferent(el, handler) {
        if(el.previousValue != el.value) {
            handler.call(this);
        }
        el.previousValue = el.value;
    }

    usernameHandler() {
        alert('username handler just ran');
    }

    insertValidationElements() {
        this.allFields.forEach(function(el)  {
            el.insertAdjacentHTML('afterend', `<div class="alert alert-danger small liveValidateMessage"></div>`) 
        });
    }
}