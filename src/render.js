const handleProcessState = (elements, processState, i18nextInstance) => {
  const btn = elements.submitButton;
  const feedbackElement = elements.feedback;
  switch (processState) {
    case 'error':
      ByteLengthQueuingStrategy.disabled = false;
      elements.rssUrl.classList.add('is-invalid');
      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.add('text-danger');
      break;

    case 'waiting':
      btn.disabled = true;
      elements.rssUrl.classList.remove('is-invalid');
      elements.rssUrl.focus();
      elements.form.reset();
      break;

    case 'filling':
      btn.disabled = false;
      break;

    case 'success':
      btn.disabled = false;
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
const renderBlockFeeds = (feeds) => {
  const cardFeeds = document.createElement('div');
  cardFeeds.classList.add('card', 'border-0');
  const cardTitleFeeds = document.createElement('div');
  cardTitleFeeds.classList.add('card-body');
  const titleFeeds = document.createElement('h2');
  titleFeeds.classList.add('card-title', 'h4');
  titleFeeds.textContent = 'Фиды';
  const listFeeds = document.createElement('ul');
  listFeeds.classList.add('list-group', 'border-0', 'rounded-0');
  feeds.prepend(cardFeeds);
  cardFeeds.prepend(cardTitleFeeds);
  cardTitleFeeds.prepend(titleFeeds);
  cardFeeds.append(listFeeds);
  return listFeeds;
};
const renderBlockPosts = (posts) => {
  const cardPosts = document.createElement('div');
  cardPosts.classList.add('card', 'border-0');
  const cardTitlePosts = document.createElement('div');
  cardTitlePosts.classList.add('card-body');
  const titlePosts = document.createElement('h2');
  titlePosts.classList.add('card-title', 'h4');
  titlePosts.textContent = 'Посты';
  const listPosts = document.createElement('ul');
  listPosts.classList.add('list-group', 'border-0', 'rounded-0');
  posts.prepend(cardPosts);
  cardPosts.prepend(cardTitlePosts);
  cardTitlePosts.prepend(titlePosts);
  cardPosts.append(listPosts);
  return listPosts;
};
const renderRss = ({ posts, feeds }, rss) => {
  const listFeeds = document.querySelector('div.feeds ul') === null ? renderBlockFeeds(feeds) : document.querySelector('div.feeds ul');
  const listItem = document.createElement('li');
  listItem.classList.add('list-group-item', 'border-0', 'border-end-0');
  const listItemTitle = document.createElement('h3');
  listItemTitle.classList.add('h6', 'm-0');
  listItemTitle.textContent = rss.feed.feedTitle;
  const listItemDescription = document.createElement('p');
  listItemDescription.classList.add('m-0', 'small', 'text-black-50');
  listItemDescription.textContent = rss.feed.feedDescription;
  listFeeds.prepend(listItem);
  listItem.append(listItemTitle);
  listItem.append(listItemDescription);
  const listPosts = document.querySelector('div.posts ul') === null ? renderBlockPosts(posts) : document.querySelector('div.posts ul');
  rss.posts.forEach((post) => {
    const postItem = document.createElement('li');
    postItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const postItemLink = document.createElement('a');
    postItemLink.classList.add('fw-bold');
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
    postPreviewBtn.textContent = 'Посмотр';
    listPosts.prepend(postItem);
    postItem.append(postItemLink);
    postItem.append(postPreviewBtn);
  });
};

const render = (elements, i18nextInstance) => (path, value) => {
  // console.log(path, '\n', value);
  switch (path) {
    case 'form.processState':
      handleProcessState(elements, value, i18nextInstance);
      break;

    case 'form.errors':
      renderErrors(elements, value, i18nextInstance);
      break;

    case 'form.addedRss':
      renderRss(elements, value);
      break;

    default:
      break;
  }
};

export default render;
