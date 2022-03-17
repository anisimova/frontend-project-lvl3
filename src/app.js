import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import axios from 'axios';
import resources from './locales/ru.js';
import parser from './parser.js';
import render from './render.js';

const app = (i18nextInstance) => {
  yup.setLocale({
    string: {
      url: () => ({ key: 'invalidUrl' }),
    },
    mixed: {
      notOneOf: () => ({ key: 'notOneOf' }),
    },
  });
  const isValid = (enteredUrl, urls) => yup.string().url().notOneOf(urls).validate(enteredUrl);

  const elements = {
    form: document.querySelector('.rss-form'),
    rssUrl: document.querySelector('#url-input'),
    submitButton: document.querySelector('button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
  };
  // console.log(elements.rssUrl);
  const state = {
    form: {
      enteredUrl: '',
      addedRss: {},
      valid: true,
      processState: 'filling',
      processError: null,
      errors: {},
      addedUrls: [],
    },
  };

  const watchedState = onChange(state, render(elements, i18nextInstance));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const dataForm = Object.fromEntries(formData);
    state.form.enteredUrl = dataForm.url;
    isValid(state.form.enteredUrl, state.form.addedUrls)
      .then(() => {
        state.form.addedUrls.push(state.form.enteredUrl);
        watchedState.form.processState = 'waiting';
        axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(state.form.enteredUrl)}`)
          .then((response) => {
            watchedState.form.addedRss = parser(response);
            watchedState.form.processState = 'success';
          })
          .catch((err) => {
            watchedState.form.processState = 'error';
            watchedState.form.errors = err.name;
          });
      })
      .catch((err) => {
        const [{ key }] = err.errors;
        watchedState.form.processState = 'error';
        watchedState.form.errors = key;
      });
  });
};
const runApp = () => {
  const i18nextInstance = i18n.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  }).then(() => app(i18nextInstance));
};

export default runApp;
