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

import MessagePlaceholder, { MessagePlaceholderOptions } from '../src/placeholder/MessagePlaceholder';

describe('MessagePlaceholder Tests', () => {
    let messagePlaceholder: MessagePlaceholder;

    beforeEach(() => {
        messagePlaceholder = new MessagePlaceholder();
    });

    test('format string with placeholders', () => {
        const format = 'Hello, ${name}! You have ${count} messages.';
        const values: MessagePlaceholderOptions = { name: 'John', count: 3 };
        const result = messagePlaceholder.fastFormat(format, values);
        expect(result).toEqual('Hello, John! You have 3 messages.');
    });

    test('add default replacements', () => {
        const defaultReplacements: MessagePlaceholderOptions = { greeting: 'Hi', count: 0 };
        messagePlaceholder.addDefaultReplacements(defaultReplacements);
        expect(messagePlaceholder.getDefaultReplacements()).toEqual(defaultReplacements);
    });

    test('get default replacements', () => {
        const defaultReplacements: MessagePlaceholderOptions = { greeting: 'Hi', count: 0 };
        messagePlaceholder.addDefaultReplacements(defaultReplacements);
        const result = messagePlaceholder.getDefaultReplacements();
        expect(result).toEqual(defaultReplacements);
    });

    test('set default replacements', () => {
        const newDefaultReplacements: MessagePlaceholderOptions = { greeting: 'Hello', count: 5 };
        messagePlaceholder.setDefaultReplacements(newDefaultReplacements);
        expect(messagePlaceholder.getDefaultReplacements()).toEqual(newDefaultReplacements);
    });
});
