let author = 'Nikita Kiselev';

$("#carousel").owlCarousel({
    items: 6,
    autoPlay: 5000,
    pagination: false,
    responsive: false
});

// Fancybox initialization
$('.js-fancybox-popup').fancybox({
    helpers: {
        overlay: {
            locked: false
        }
    }
});

// Ajax forms
AjaxForm.prototype.flash = (title, message, status = 'success', html = false) => {
    swal({
        title: title,
        text: message,
        type: status,
        html: html
    });
};

AjaxForm.prototype.error = function() {
    this.flash('Ошибка', this.config.lang.unknownError, 'error');
};

AjaxForm.prototype.onSubmited = function (response) {
    this.reset();

    if (response.status === 'success') {
        return this.flash('Выполнено', response.message, 'success')
    }

    return this.flash('Ошибка', response.message, 'error')
};

let callbackForm = new AjaxForm('#callback-form');
callbackForm.populateErrors = (ajaxForm, errorsJson) => {
    let message = `При отправке формы возникли следующие ошибки: <br><br>`;

    $.each(errorsJson, (field, errors) => {
        message += `${errors[0]}<br>`;
    });

    ajaxForm.flash('Форма не отправлена', message, 'error', true);
};

let popupCallbackForm = new AjaxForm('#callback-popup-form', {
    autoHelpBlock: true
});
