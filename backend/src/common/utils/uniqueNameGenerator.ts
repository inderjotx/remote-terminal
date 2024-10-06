import { uniqueNamesGenerator, adjectives, colors, animals, starWars, names, countries } from 'unique-names-generator'


export const uniqueName = () => uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals, names, starWars, countries],
    separator: '-',
    length: 3
});
