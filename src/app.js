import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import resources from './locales/ru.js';

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

  const handleProcessState = (elements, processState) => {
    switch (processState) {
      case 'error':
        elements.rssUrl.classList.add('is-invalid');
        break;

      case 'waiting':
        elements.rssUrl.classList.remove('is-invalid');
        elements.rssUrl.focus();
        elements.form.reset();
        break;

      case 'filling':
        break;

      case 'success':
        break;

      default:
        throw new Error(`Unknown process state: ${processState}`);
    }
  };
  const renderErrors = (elements, err) => {
    const feedbackElement = elements.feedback;
    feedbackElement.textContent = i18nextInstance.t(`feedback.error.${err}`);
  };
  const render = (elements) => (path, value) => {
    switch (path) {
      case 'form.processState':
        handleProcessState(elements, value);
        break;

      case 'form.errors':
        renderErrors(elements, value);
        break;

      default:
        break;
    }
  };
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
      valid: true,
      processState: 'filling',
      processError: null,
      errors: {},
      addedUrls: [],
    },
  };
  const watchedState = onChange(state, render(elements));
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const dataForm = Object.fromEntries(formData);
    state.form.enteredUrl = dataForm.url;
    isValid(state.form.enteredUrl, state.form.addedUrls)
      .then(() => {
        state.form.addedUrls.push(state.form.enteredUrl);
        watchedState.form.processState = 'waiting';
        // console.log(state.form.addedUrls);
      })
      .catch((err) => {
        // console.log(err);
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
