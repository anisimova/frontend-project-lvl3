import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import axios from 'axios';
import resources from './locales/ru.js';
import parser from './parser.js';
import view from './view.js';

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
    rss: {
      feeds: [],
      posts: [],
      readPostsId: [],
    },
  };

  const watchedState = onChange(state, view(elements, i18nextInstance));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const dataForm = Object.fromEntries(formData);
    state.form.enteredUrl = dataForm.url;
    isValid(state.form.enteredUrl, state.form.addedUrls)
      .then(() => {
        watchedState.form.processState = 'waiting';
        axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(state.form.enteredUrl)}`)
          .then((response) => {
            state.form.addedUrls.push(state.form.enteredUrl);
            const { feed, posts } = parser(response);
            feed.rssUrl = state.form.enteredUrl;
            watchedState.rss.posts = state.rss.posts.concat(posts);
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
      state.rss.feeds.forEach(({ rssUrl }) => {
        axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(rssUrl)}`)
          .then((response) => {
            const { posts } = parser(response);
            const addedPostLinks = state.rss.posts.map(({ itemLink }) => itemLink);
            const newPosts = posts.filter(({ itemLink }) => !addedPostLinks.includes(itemLink));
            watchedState.rss.posts = state.rss.posts.concat(newPosts);
          })
          .catch((err) => {
            watchedState.form.processState = 'error';
            watchedState.form.errors = err.name;
          });
      });
      update();
    }, 5000);
  };
  update();
  elements.posts.addEventListener('click', (e) => {
    e.preventDefault();
    const clickedPost = state.rss.posts.filter(({ itemId }) => itemId === e.target.dataset.id);
    watchedState.modalIdPost = clickedPost;
    watchedState.rss.posts = state.rss.posts.map((post) => {
      if (post.itemId === e.target.dataset.id) return { ...post, read: true };
      return post;
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
