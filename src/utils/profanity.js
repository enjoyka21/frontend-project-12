
import filter from 'leo-profanity';

filter.loadDictionary('en');

const englishWords = filter.list();
filter.loadDictionary('ru');
filter.add(englishWords);

const cleanText = (text) => filter.clean(text);

export default cleanText;
