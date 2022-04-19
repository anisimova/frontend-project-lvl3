export default (response) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(response.data.contents, 'application/xml');
  const feedTitle = doc.querySelector('title');
  const feedDescription = doc.querySelector('description');
  const feed = {
    feedTitle: feedTitle.textContent,
    feedDescription: feedDescription.textContent,
  };
  const items = doc.querySelectorAll('item');
  const posts = Array.from(items).map((item) => {
    const itemTitle = item.querySelector('title');
    const itemDescription = item.querySelector('description');
    const itemLink = item.querySelector('link');
    return {
      itemTitle: itemTitle.textContent,
      itemDescription: itemDescription.textContent,
      itemLink: itemLink.textContent,
    };
  }).reverse();
  return { feed, posts };
};
