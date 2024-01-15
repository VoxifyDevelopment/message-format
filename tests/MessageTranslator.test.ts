/**
 * Copyright (c) 2023 - present | sanguine6660 <sanguine6660@gmail.com>
 * Copyright (c) 2023 - present | voxify.dev <contact@voxify.dev>
 * Copyright (c) 2023 - present | voxify.dev team and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import * as fs from 'node:fs';
import MessageTranslator from '../src/translations/MessageTranslator';

describe('MessageTranslator Tests', () => {
    let translator: MessageTranslator;

    beforeEach(() => {
        translator = new MessageTranslator({});
        translator.loadTranslationsFromFolder(`${__dirname}/locales/`, 'en');
    });

    test('loading a language folder', () => {
        expect(translator.getDefaultFallback()).toEqual({ 'lang.hello': 'Hello!' });
        expect(translator.getAvailableLanguages()).toContain('en');
        expect(translator.getAvailableLanguages()).toContain('de');
    });

    test('translate should return the translated string defaulting to en', () => {
        const result = translator.translate('lang.hello');
        expect(result).toEqual('Hello!');
    });

    test('translateTo should return the translated strings in given language', () => {
        const resultDe = translator.translateTo('de', 'lang.hello');
        expect(resultDe).toEqual('Hallo!');
        const resultEn = translator.translateTo('en', 'lang.hello');
        expect(resultEn).toEqual('Hello!');
    });

    test('translateTo should fallback to default language if translation key not found in specified language', () => {
        const resultFr = translator.translateTo('fr', 'lang.hello');
        const resultDefault = translator.translate('lang.hello');

        expect(resultFr).toEqual(resultDefault);
    });

    test('uppercaseSuffix should correctly convert the lowercase suffix to uppercase', () => {
        const result = translator.uppercaseSuffix('lang.hello-world');
        expect(result).toEqual('lang.hello-WORLD');
    });

    test('initializeLocales should initialize locales correctly', () => {
        const locales = translator.initializeLocales();
        expect(locales.en).toBe(undefined);
        expect(locales.de).toBe(undefined);
    });
});
