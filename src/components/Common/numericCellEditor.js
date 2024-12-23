const KEY_BACKSPACE = 'Backspace';
export default class NumericCellEditor {
    eInput;
    cancelBeforeStart;

    init(params) {
        this.eInput = document.createElement('input');
        this.eInput.className = 'numeric-input';
        const eventKey = params.eventKey;
        if (eventKey === KEY_BACKSPACE) {
            this.eInput.value = '';
        } else if (this.isCharNumeric(eventKey)) {
            this.eInput.value = eventKey;
        } else {
            if (params.value !== undefined && params.value !== null) {
                this.eInput.value = params.value;
            }
        }
        this.eInput.addEventListener('keydown', (event) => {
            if (!event.key || event.key.length !== 1) {
                return;
            }
            if (!this.isNumericKey(event)) {
                this.eInput.focus();
                if (event.preventDefault) event.preventDefault();
            } else if (this.isNavigationKey(event) || this.isBackspace(event)) {
                event.stopPropagation();
            }
        });
        const isCharacter = eventKey && eventKey.length === 1;
        var isNotANumber = isCharacter && '1234567890'.indexOf(eventKey) < 0;
        this.cancelBeforeStart = !!isNotANumber;
    }

    isNumericKey(event) {
        const charStr = event.key;
        return this.isCharNumeric(charStr);
    }

    isBackspace(event) {
        return event.key === KEY_BACKSPACE;
    }

    isNavigationKey(event) {
        return event.key === 'ArrowLeft' || event.key === 'ArrowRight';
    }

    isCharNumeric(charStr) {
        return charStr && !!/\d/.test(charStr);
    }

    getGui() {
        return this.eInput;
    }

    afterGuiAttached() {
        this.eInput.focus();
    }

    isCancelBeforeStart() {
        return this.cancelBeforeStart;
    }


    isCancelAfterEnd() {
        var value = this.getValue();
        return value.indexOf('007') >= 0;
    }

    getValue() {
        return this.eInput.value;
    }


    destroy() {

    }
}