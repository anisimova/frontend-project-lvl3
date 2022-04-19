const handleProcessState = (elements, processState, i18nextInstance) => {
  const btn = elements.submitButton;
  const feedbackElement = elements.feedback;
  const inputUrlField = elements.rssUrl;
  switch (processState) {
    case 'error':
      btn.disabled = false;
      inputUrlField.removeAttribute('readonly');
      inputUrlField.classList.add('is-invalid');
      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.add('text-danger');
      break;

    case 'waiting':
      btn.disabled = true;
      inputUrlField.setAttribute('readonly', '');
      inputUrlField.classList.remove('is-invalid');
      inputUrlField.focus();
      inputUrlField.value = '';
      break;

    case 'filling':
      btn.disabled = false;
      break;

    case 'success':
      btn.disabled = false;
      inputUrlField.removeAttribute('readonly');
      feedbackElement.classList.remove('text-danger');
      feedbackElement.classList.add('text-success');
      feedbackElement.textContent = i18nextInstance.t('feedback.success');
      break;

    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const renderErrors = (elements, err, i18nextInstance) => {
  const feedbackElement = elements.feedback;
  feedbackElement.textContent = i18nextInstance.t(`feedback.${err}`);
};
const renderBlockFeeds = (feeds, i18nextInstance) => {
  if (document.querySelector('.feeds .list-group')) return document.querySelector('.feeds .list-group');
  const cardFeeds = document.createElement('div');
  cardFeeds.classList.add('card', 'border-0');
  const cardTitleFeeds = document.createElement('div');
  cardTitleFeeds.classList.add('card-body');
  const titleFeeds = document.createElement('h2');
  titleFeeds.classList.add('card-title', 'h4');
  titleFeeds.textContent = i18nextInstance.t('headers.feeds');
  const listFeeds = document.createElement('ul');
  listFeeds.classList.add('list-group', 'border-0', 'rounded-0');
  feeds.prepend(cardFeeds);
  cardFeeds.prepend(cardTitleFeeds);
  cardTitleFeeds.prepend(titleFeeds);
  cardFeeds.append(listFeeds);
  return listFeeds;
};
const renderBlockPosts = (posts, i18nextInstance) => {
  if (document.querySelector('.posts .list-group')) return document.querySelector('.posts .list-group');
  const cardPosts = document.createElement('div');
  cardPosts.classList.add('card', 'border-0');
  const cardTitlePosts = document.createElement('div');
  cardTitlePosts.classList.add('card-body');
  const titlePosts = document.createElement('h2');
  titlePosts.classList.add('card-title', 'h4');
  titlePosts.textContent = i18nextInstance.t('headers.posts');
  const listPosts = document.createElement('ul');
  listPosts.classList.add('list-group', 'border-0', 'rounded-0');
  posts.prepend(cardPosts);
  cardPosts.prepend(cardTitlePosts);
  cardTitlePosts.prepend(titlePosts);
  cardPosts.append(listPosts);
  return listPosts;
};
const renderFeeds = ({ feeds }, allFeeds, i18nextInstance) => {
  const view = renderBlockFeeds(feeds, i18nextInstance);
  view.textContent = '';
  allFeeds.forEach(({ feedTitle, feedDescription }) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'border-0', 'border-end-0');
    const listItemTitle = document.createElement('h3');
    listItemTitle.classList.add('h6', 'm-0');
    listItemTitle.textContent = feedTitle;
    const listItemDescription = document.createElement('p');
    listItemDescription.classList.add('m-0', 'small', 'text-black-50');
    listItemDescription.textContent = feedDescription;
    view.prepend(listItem);
    listItem.append(listItemTitle);
    listItem.append(listItemDescription);
  });
};
const renderPosts = ({ posts }, allPosts, i18nextInstance, state) => {
  const view = renderBlockPosts(posts, i18nextInstance);
  view.textContent = '';
  allPosts.forEach((post) => {
    const postItem = document.createElement('li');
    postItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const postItemLink = document.createElement('a');
    if (state.rss.readPostsId.includes(post.itemId)) {
      postItemLink.classList.add('fw-normal', 'link-secondary');
    } else {
      postItemLink.classList.add('fw-bold');
    }
    postItemLink.setAttribute('data-id', post.itemId);
    postItemLink.setAttribute('target', '_blank');
    postItemLink.setAttribute('rel', 'noopener noreferrer');
    postItemLink.href = post.itemLink;
    postItemLink.textContent = post.itemTitle;
    const postPreviewBtn = document.createElement('button');
    postPreviewBtn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    postPreviewBtn.setAttribute('type', 'button');
    postPreviewBtn.setAttribute('data-id', post.itemId);
    postPreviewBtn.setAttribute('data-bs-toggle', 'modal');
    postPreviewBtn.setAttribute('data-bs-target', '#modal');
    postPreviewBtn.setAttribute('name', i18nextInstance.t('buttons.viewing'));
    postPreviewBtn.textContent = i18nextInstance.t('buttons.viewing');
    view.prepend(postItem);
    postItem.append(postItemLink);
    postItem.append(postPreviewBtn);
  });
};

const renderModal = (elements, post) => {
  const title = elements.modalTitle;
  const body = elements.modalBody;
  const linkFullPost = elements.modalUrl;
  body.classList.add('text-break');
  title.textContent = post[0].itemTitle;
  body.textContent = post[0].itemDescription;
  linkFullPost.href = post[0].itemLink;
};

const renderReadPosts = (elements, posts) => {
  posts.forEach((postId) => {
    const post = document.querySelector(`a[data-id="${postId}"]`);
    post.classList.remove('fw-bold');
    post.classList.add('fw-normal', 'link-secondary');
  });
};
const render = (elements, i18nextInstance, state) => (path, value) => {
  switch (path) {
    case 'form.processState':
      handleProcessState(elements, value, i18nextInstance);
      break;

    case 'form.errors':
      renderErrors(elements, value, i18nextInstance);
      break;

    case 'modalIdPost':
      renderModal(elements, value);
      break;

    case 'rss.feeds':
      renderFeeds(elements, value, i18nextInstance);
      break;

    case 'rss.posts':
      renderPosts(elements, value, i18nextInstance, state);
      break;

    case 'rss.readPostsId':
      renderReadPosts(elements, value);
      break;

    default:
      throw new Error(`Unknown process state: ${path}`);
  }
};

export default render;
