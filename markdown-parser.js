/**
 * 卡牌编辑器的Markdown解析器
 * 用于导入导出卡牌和卡组的Markdown格式
 */

// 卡牌的Markdown格式定义
// # 卡牌名称
// 
// ## 费用
// 木: 1, 火: 0, 土: 2, 金: 0, 水: 1
// 
// ## 图片
// https://example.com/image.jpg
// 
// ## 描述
// 卡牌描述文本
// 
// ## 符文
// - 符文1
// - 符文2

/**
 * 将卡牌对象转换为Markdown格式
 * @param {Object} card - 卡牌对象
 * @returns {string} - Markdown格式的卡牌
 */
function cardToMarkdown(card) {
    let markdown = `# ${card.name || '未命名卡牌'}\n\n`;
    
    // 添加费用
    markdown += `## 费用\n`;
    markdown += `木: ${card.costs.wood || 0}, 火: ${card.costs.fire || 0}, 土: ${card.costs.earth || 0}, 金: ${card.costs.metal || 0}, 水: ${card.costs.water || 0}\n\n`;
    
    // 添加图片URL（如果有）
    if (card.imageUrl) {
        markdown += `## 图片\n`;
        markdown += `${card.imageUrl}\n\n`;
    }
    
    // 添加描述
    markdown += `## 描述\n`;
    markdown += `${card.description || ''}\n\n`;
    
    // 添加符文
    if (card.runes && card.runes.length > 0) {
        markdown += `## 符文\n`;
        card.runes.forEach(rune => {
            if (rune && rune.trim() !== '') {
                markdown += `- ${rune}\n`;
            }
        });
    }
    
    return markdown;
}

/**
 * 解析Markdown格式的卡牌
 * @param {string} markdown - Markdown格式的卡牌
 * @returns {Object|null} - 解析后的卡牌对象，解析失败则返回null
 */
function parseCardMarkdown(markdown) {
    try {
        const card = {
            name: '',
            costs: {
                wood: 0,
                fire: 0,
                earth: 0,
                metal: 0,
                water: 0
            },
            imageUrl: '',
            description: '',
            runes: []
        };
        
        // 解析卡牌名称
        const nameMatch = markdown.match(/^# (.+)$/m);
        if (nameMatch && nameMatch[1]) {
            card.name = nameMatch[1].trim();
        }
        
        // 解析费用
        const costsSection = markdown.match(/## 费用\s*\n([\s\S]*?)(?=\n##|$)/);
        if (costsSection && costsSection[1]) {
            try {
                const costsText = costsSection[1].trim();
                // 解析元素费用格式: 木: 1, 火: 0, 土: 2, 金: 0, 水: 1
                const woodMatch = costsText.match(/木:\s*(\d+)/);
                if (woodMatch) card.costs.wood = parseInt(woodMatch[1]);
                
                const fireMatch = costsText.match(/火:\s*(\d+)/);
                if (fireMatch) card.costs.fire = parseInt(fireMatch[1]);
                
                const earthMatch = costsText.match(/土:\s*(\d+)/);
                if (earthMatch) card.costs.earth = parseInt(earthMatch[1]);
                
                const metalMatch = costsText.match(/金:\s*(\d+)/);
                if (metalMatch) card.costs.metal = parseInt(metalMatch[1]);
                
                const waterMatch = costsText.match(/水:\s*(\d+)/);
                if (waterMatch) card.costs.water = parseInt(waterMatch[1]);
            } catch (e) {
                console.error('解析费用失败:', e);
                // 保持默认值
            }
        }
        
        // 解析图片URL
        const imageSection = markdown.match(/## 图片\s*\n([\s\S]*?)(?=\n##|$)/);
        if (imageSection && imageSection[1]) {
            card.imageUrl = imageSection[1].trim();
        }
        
        // 解析描述
        const descriptionSection = markdown.match(/## 描述\s*\n([\s\S]*?)(?=\n##|$)/);
        if (descriptionSection && descriptionSection[1]) {
            card.description = descriptionSection[1].trim();
        }
        
        // 解析符文
        const runesSection = markdown.match(/## 符文\s*\n([\s\S]*?)(?=\n##|$)/);
        if (runesSection && runesSection[1]) {
            const runeLines = runesSection[1].split('\n');
            runeLines.forEach(line => {
                const runeMatch = line.match(/^- (.+)$/);
                if (runeMatch && runeMatch[1]) {
                    card.runes.push(runeMatch[1].trim());
                }
            });
        }
        
        return card;
    } catch (error) {
        console.error('解析卡牌Markdown失败:', error);
        return null;
    }
}

/**
 * 将卡组对象转换为Markdown格式
 * @param {Object} deck - 卡组对象
 * @returns {string} - Markdown格式的卡组
 */
function deckToMarkdown(deck) {
    let markdown = `# 卡组: ${deck.name || '未命名卡组'}\n\n`;
    
    if (deck.description) {
        markdown += `${deck.description}\n\n`;
    }
    
    markdown += `## 卡牌列表\n\n`;
    
    if (deck.cards && deck.cards.length > 0) {
        deck.cards.forEach((card, index) => {
            markdown += `### 卡牌 ${index + 1}: ${card.name || '未命名卡牌'}\n\n`;
            
            // 添加费用
            markdown += `#### 费用\n`;
            markdown += `木: ${card.costs.wood || 0}, 火: ${card.costs.fire || 0}, 土: ${card.costs.earth || 0}, 金: ${card.costs.metal || 0}, 水: ${card.costs.water || 0}\n\n`;
            
            // 添加图片URL（如果有）
            if (card.imageUrl) {
                markdown += `#### 图片\n`;
                markdown += `${card.imageUrl}\n\n`;
            }
            
            // 添加描述
            markdown += `#### 描述\n`;
            markdown += `${card.description || ''}\n\n`;
            
            // 添加符文
            if (card.runes && card.runes.length > 0) {
                markdown += `#### 符文\n`;
                card.runes.forEach(rune => {
                    if (rune && rune.trim() !== '') {
                        markdown += `- ${rune}\n`;
                    }
                });
                markdown += '\n';
            }
        });
    }
    
    return markdown;
}

/**
 * 解析Markdown格式的卡组
 * @param {string} markdown - Markdown格式的卡组
 * @returns {Object|null} - 解析后的卡组对象，解析失败则返回null
 */
function parseDeckMarkdown(markdown) {
    try {
        const deck = {
            name: '',
            description: '',
            cards: []
        };
        
        // 解析卡组名称
        const nameMatch = markdown.match(/^# 卡组: (.+)$/m);
        if (nameMatch && nameMatch[1]) {
            deck.name = nameMatch[1].trim();
        }
        
        // 解析卡组描述（卡组名称和卡牌列表之间的文本）
        const descriptionMatch = markdown.match(/^# 卡组: .+\n\n([\s\S]*?)(?=\n## 卡牌列表)/m);
        if (descriptionMatch && descriptionMatch[1]) {
            deck.description = descriptionMatch[1].trim();
        }
        
        // 解析卡牌列表
        const cardsSection = markdown.match(/## 卡牌列表\n\n([\s\S]*?)(?=$)/);
        if (cardsSection && cardsSection[1]) {
            // 使用正则表达式分割每张卡牌
            const cardSections = cardsSection[1].split(/### 卡牌 \d+: /);
            // 跳过第一个空元素
            for (let i = 1; i < cardSections.length; i++) {
                const cardSection = cardSections[i];
                
                const card = {
                    name: '',
                    costs: [0],
                    description: '',
                    runes: []
                };
                
                // 解析卡牌名称
                const nameEndIndex = cardSection.indexOf('\n');
                if (nameEndIndex > 0) {
                    card.name = cardSection.substring(0, nameEndIndex).trim();
                }
                
                // 解析费用
                const costsSection = cardSection.match(/#### 费用\s*\n([\s\S]*?)(?=\n####|$)/);
                if (costsSection && costsSection[1]) {
                    try {
                        const costsText = costsSection[1].trim();
                        // 解析元素费用格式
                        const woodMatch = costsText.match(/木:\s*(\d+)/);
                        if (woodMatch) card.costs.wood = parseInt(woodMatch[1]);
                        
                        const fireMatch = costsText.match(/火:\s*(\d+)/);
                        if (fireMatch) card.costs.fire = parseInt(fireMatch[1]);
                        
                        const earthMatch = costsText.match(/土:\s*(\d+)/);
                        if (earthMatch) card.costs.earth = parseInt(earthMatch[1]);
                        
                        const metalMatch = costsText.match(/金:\s*(\d+)/);
                        if (metalMatch) card.costs.metal = parseInt(metalMatch[1]);
                        
                        const waterMatch = costsText.match(/水:\s*(\d+)/);
                        if (waterMatch) card.costs.water = parseInt(waterMatch[1]);
                    } catch (e) {
                        console.error('解析卡牌费用失败:', e);
                        // 保持默认值
                    }
                }
                
                // 解析图片URL
                const imageSection = cardSection.match(/#### 图片\s*\n([\s\S]*?)(?=\n####|$)/);
                if (imageSection && imageSection[1]) {
                    card.imageUrl = imageSection[1].trim();
                }
                
                // 解析描述
                const descriptionSection = cardSection.match(/#### 描述\s*\n([\s\S]*?)(?=\n####|$)/);
                if (descriptionSection && descriptionSection[1]) {
                    card.description = descriptionSection[1].trim();
                }
                
                // 解析符文
                const runesSection = cardSection.match(/#### 符文\s*\n([\s\S]*?)(?=\n####|$)/);
                if (runesSection && runesSection[1]) {
                    const runeLines = runesSection[1].split('\n');
                    runeLines.forEach(line => {
                        const runeMatch = line.match(/^- (.+)$/);
                        if (runeMatch && runeMatch[1]) {
                            card.runes.push(runeMatch[1].trim());
                        }
                    });
                }
                
                deck.cards.push(card);
            }
        }
        
        return deck;
    } catch (error) {
        console.error('解析卡组Markdown失败:', error);
        return null;
    }
}

/**
 * 检测Markdown是卡牌还是卡组
 * @param {string} markdown - Markdown文本
 * @returns {string} - 'card', 'deck', 或 'unknown'
 */
function detectMarkdownType(markdown) {
    if (markdown.match(/^# 卡组:/m)) {
        return 'deck';
    } else if (markdown.match(/^# .+\s*\n\s*## 费用/m)) {
        return 'card';
    } else {
        return 'unknown';
    }
}
