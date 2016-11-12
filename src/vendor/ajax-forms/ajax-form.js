function AjaxForm(el, config) {
    this.init(el, config);
    this.initEvents();
}

AjaxForm.prototype.SUCCESS = 'success';
AjaxForm.prototype.ERROR = 'error';
AjaxForm.prototype.INFO = 'info';

AjaxForm.prototype.init = function(el, config) {
    this.$form = $(el);
    this.$components = this.$form.find('input, textarea, button');
    this.$submit = this.$form.find('[type=submit]');
    this.action = this.$form.attr('action');

    var defaultConfig = {
        autoHelpBlock: false,
        controlClass: '.form-control',
        controlWrapper: '.form-group',
        controlErrorClass: 'has-error',
        controlErrorBlock: '.help-block',
        lang: {
            unknownError: 'Возникла непредвиденная ошибка. Попробуйте перезагрузить страницу. Приносим свои извинения за неудобства.',
            submitButtonLoadingState: '<i class="fa fa-spinner fa-spin"></i> Отправка...'
        }
    };

    this.config = $.extend({}, defaultConfig, config);
};

AjaxForm.prototype.initEvents = function() {
    var ajaxForm = this;

    ajaxForm.$form.on('submit', function(event) {
        event.preventDefault();
        ajaxForm.submit();
    });
};

AjaxForm.prototype.populateErrors = function(ajaxForm, errorsJson)
{
    $.each(errorsJson, function(field, errors)
    {
        var $formGroup = ajaxForm.$form.find('[name=' + field + ']').closest(ajaxForm.config.controlWrapper),
            $helpBlock = $formGroup.find(ajaxForm.config.controlErrorBlock);

        if ( ! $formGroup.length)
        {
            return;
        }

        if ( ! $helpBlock.length && ajaxForm.config.autoHelpBlock)
        {
            $helpBlock = $('<div class="' + ajaxForm.config.controlErrorBlock.replace('.', '') + '"></div>');
            $formGroup.append($helpBlock);
        }

        $formGroup.addClass(ajaxForm.config.controlErrorClass);

        $helpBlock.html(errors.shift());
    });

    return this;
};

AjaxForm.prototype.clearErrors = function() {
    var ajaxForm = this;

    this.$form.find('input, textarea, button').each(function(index, component) {
        var $formGroup = $(component).closest(ajaxForm.config.controlWrapper);

        if ($formGroup.length)
        {
            $formGroup
                .removeClass(ajaxForm.config.controlErrorClass)
                .find(ajaxForm.config.controlErrorBlock)
                .html('');
        }
    });

    return this;
};

AjaxForm.prototype.setLoadingState = function() {
    var ajaxForm = this,
        $submitButton = ajaxForm.$submit;

    ajaxForm.clearErrors();
    ajaxForm.$components.prop('readonly', true);
    $submitButton.data('oldhtml', $submitButton.html());
    $submitButton.html(ajaxForm.config.lang.submitButtonLoadingState);
    $submitButton.prop('disabled', true).addClass('disabled');

    return this;
};

AjaxForm.prototype.reset = function() {
    this.resetState();
    this.$form.trigger('reset');
};

AjaxForm.prototype.resetState = function() {
    var ajaxForm = this,
        $submitButton = ajaxForm.$submit;

    ajaxForm.$components.prop('readonly', false);
    $submitButton.html($submitButton.data('oldhtml'));
    $submitButton.prop('disabled', false).removeClass('disabled');

    return this;
};

AjaxForm.prototype.flash = function(message, status) {
    var ajaxForm = this;
    status = status || ajaxForm.INFO;
    alert(status + ': ' + message);

    return this;
};

AjaxForm.prototype.error = function() {
    this.flash(this.config.lang.unknownError, 'error');
};

AjaxForm.prototype.submit = function() {
    var ajaxForm = this;
    ajaxForm.setLoadingState();

    $.post(ajaxForm.action, ajaxForm.$form.serialize(), function(data) {
            ajaxForm.onSubmited.call(ajaxForm, data);
        })
        .error(function(jqXHR, textStatus, errorThrown) {
            ajaxForm.onError.call(ajaxForm, jqXHR);

            if (jqXHR.status === 422)
            {
                ajaxForm.populateErrors(ajaxForm, jqXHR.responseJSON);

                return;
            }

            ajaxForm.error();
        })
        .always(function() {
            ajaxForm.resetState();
        });
};

AjaxForm.prototype.onSubmited = function(data) {};
AjaxForm.prototype.onError = function(jqXHR) {};