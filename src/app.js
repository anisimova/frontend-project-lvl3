import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import resources from './locales/ru.js';
import parser from './parser.js';
import render from './render.js';
import generateRequestLink from './utils.js';

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
    btns: document.querySelectorAll('.posts .btn'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalUrl: document.querySelector('.modal-footer .full-article'),
  };
  const state = {
    form: {
      enteredUrl: '',
      valid: true,
      processState: 'filling',
      processError: null,
      errors: {},
      addedUrls: [],
    },
    rss: {
      feeds: [],
      posts: [],
      readPostsId: [],
    },
  };

  const watchedState = onChange(state, render(elements, i18nextInstance, state));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const dataForm = Object.fromEntries(formData);
    state.form.enteredUrl = dataForm.url;
    watchedState.form.processState = 'waiting';
    isValid(state.form.enteredUrl, state.form.addedUrls)
      .then(() => {
        axios.get(generateRequestLink(state.form.enteredUrl))
          .then((response) => {
            state.form.addedUrls.push(state.form.enteredUrl);
            const { feed, posts } = parser(response);
            feed.rssUrl = state.form.enteredUrl;
            const postsWithId = posts.map((post) => _.merge(post, { itemId: _.uniqueId('post_') }));
            watchedState.rss.posts = state.rss.posts.concat(postsWithId);
            watchedState.rss.feeds = state.rss.feeds.concat(feed);
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
  const update = () => {
    setTimeout(() => {
      const promises = state.rss.feeds.map(({ rssUrl }) => axios.get(generateRequestLink(rssUrl))
        .then((response) => {
          const { posts } = parser(response);
          const addedPostLinks = state.rss.posts.map(({ itemLink }) => itemLink);
          const newPosts = posts.filter(({ itemLink }) => !addedPostLinks.includes(itemLink))
            .map((post) => _.merge(post, { itemId: _.uniqueId('post_') }));
          watchedState.rss.posts = state.rss.posts.concat(newPosts);
        }));
      const promise = Promise.all(promises);
      promise.then(() => setTimeout(update, 5000));
    }, 5000);
  };
  update();
  elements.posts.addEventListener('click', (e) => {
    e.preventDefault();
    const clickedPost = state.rss.posts.filter(({ itemId }) => itemId === e.target.dataset.id);
    watchedState.modalIdPost = clickedPost;
    watchedState.rss.readPostsId = state.rss.readPostsId.concat(e.target.dataset.id);
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
