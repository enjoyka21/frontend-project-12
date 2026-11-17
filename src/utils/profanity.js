import filter from 'leo-profanity';

filter.loadDictionary('ru');

const cleanText = (text) => filter.clean(text);

export default cleanText;
