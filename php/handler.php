<?php

require_once __DIR__."/vendor/autoload.php";

use DigitalHammer\LpForms\Form;
use DigitalHammer\LpForms\Mailer;
use DigitalHammer\LpForms\FormHandler;
use DigitalHammer\LpForms\ResponseJson;

date_default_timezone_set('Europe/Moscow');

if (strtoupper($_SERVER['REQUEST_METHOD']) !== 'POST') {
    die('Denied');
}

$post = $_POST;
$formId = isset($post['form_id']) ? $post['form_id'] : null;

/**
 * Settings
 */
$siteName = 'Your site name';
$mailFrom = ['from@mail.com', $siteName];
$mailTo = 'to@mail.com';

$mailer = new Mailer($mailFrom, $mailTo);
$mailer->setSubject("'Уведомление с сайта {$siteName}'");

/**
 * Contact form
 */
$callbackForm = new Form('callback', $post, $mailer);
$callbackForm
    ->addField('name', ['required', 'lengthMax:50', 'lengthMin:3'])
    ->addField('phone', ['required', 'lengthMax:50', 'lengthMin:3'])
    ->setFieldNames([
        'name' => 'Ваше имя',
        'phone' => 'Ваш телефон',
    ])
    ->setMessageBodyTemplate(__DIR__.'/emails/callback', [
        'form_name' => "Обратный звонок с сайта  {$siteName}"
    ]);

$callbackPopupForm = new Form('callback-popup', $post, $mailer);
$callbackPopupForm
    ->addField('name', ['required', 'lengthMax:50', 'lengthMin:3'])
    ->addField('phone', ['required', 'lengthMax:50', 'lengthMin:3'])
    ->addField('email', ['required', 'email'])
    ->setFieldNames([
        'name' => 'Ваше имя',
        'phone' => 'Ваш телефон',
        'email' => 'Ваш e-mail',
    ])
    ->setMessageBodyTemplate(__DIR__.'/emails/callback_popup', [
        'form_name' => "Обратный звонок с сайта {$siteName}"
    ]);

$formHandler = new FormHandler();
$formHandler->addForm($callbackForm);
$formHandler->addForm($callbackPopupForm);

try {
    $formHandler->handle($formId);
} catch (Exception $exception) {
    (new ResponseJson())->fail(
        $exception->getMessage()
    );
}
