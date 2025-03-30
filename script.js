/**
 * 卡牌编辑器主脚本
 */

// 全局变量
let currentDeck = {
    name: '我的卡组',
    description: '',
    cards: []
};

// 符文数据
let runesData = [];

// 元素类型
const ELEMENTS = {
    WOOD: 'wood',
    FIRE: 'fire',
    EARTH: 'earth',
    METAL: 'metal',
    WATER: 'water'
};

// 预览锁定状态
let previewLocked = false;
let lockedCard = null;
let editingCardIndex = -1; // 当前正在编辑的卡牌索引，-1表示新建卡牌

// DOM 元素
const cardForm = document.getElementById('card-form');
const cardName = document.getElementById('card-name');
const costWood = document.getElementById('cost-wood');
const costFire = document.getElementById('cost-fire');
const costEarth = document.getElementById('cost-earth');
const costMetal = document.getElementById('cost-metal');
const costWater = document.getElementById('cost-water');
const cardImageUpload = document.getElementById('card-image-upload');
const clearImageBtn = document.getElementById('clear-image');
const runeContainer = document.getElementById('rune-container');
const addRuneBtn = document.getElementById('add-rune');
const cardDescription = document.getElementById('card-description');
const saveCardBtn = document.getElementById('save-card');
const exportCardBtn = document.getElementById('export-card');
const clearFormBtn = document.getElementById('clear-form');
const importDeckBtn = document.getElementById('import-deck');
const exportDeckBtn = document.getElementById('export-deck');
const clearDeckBtn = document.getElementById('clear-deck');
const deckContainer = document.getElementById('deck-container');
const markdownContent = document.getElementById('markdown-content');
const importMarkdownBtn = document.getElementById('import-markdown');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const exportContent = document.getElementById('export-content');
const copyExportBtn = document.getElementById('copy-export');
const closeModal = document.querySelector('.close');
const themeSwitch = document.getElementById('theme-switch');

// 卡牌预览元素
const cardPreview = document.querySelector('.card');
const cardNamePreview = document.querySelector('.card-name');
const cardCostPreview = document.querySelector('.card-cost');
const cardImagePreview = document.querySelector('.card-image');
const cardDescriptionPreview = document.querySelector('.card-description');
const cardRunesPreview = document.querySelector('.card-runes');

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 加载符文数据
    await loadRunesData();
    
    // 从本地存储加载卡组
    loadDeckFromLocalStorage();
    
    // 初始化事件监听器
    initEventListeners();
    
    // 初始化卡牌预览
    updateCardPreview();
});

/**
 * 加载符文数据
 */
async function loadRunesData() {
    try {
        console.log('开始加载符文数据...');
        
        // 尝试使用绝对路径
        const response = await fetch('/runes.yaml');
        
        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status} - ${response.statusText}`);
        }
        
        console.log('成功获取YAML文件，状态:', response.status);
        const yamlText = await response.text();
        console.log('YAML文件内容长度:', yamlText.length);
        
        if (yamlText.length === 0) {
            throw new Error('YAML文件内容为空');
        }
        
        // 简单的YAML解析（仅适用于我们的格式）
        const lines = yamlText.split('\n');
        console.log('YAML文件行数:', lines.length);
        
        let currentRune = null;
        
        for (const line of lines) {
            if (line.trim().startsWith('#') || line.trim() === '') {
                continue; // 跳过注释和空行
            }
            
            if (line.trim().startsWith('- name:')) {
                if (currentRune) {
                    runesData.push(currentRune);
                }
                currentRune = {
                    name: line.split('- name:')[1].trim(),
                    description: ''
                };
            } else if (line.trim().startsWith('description:') && currentRune) {
                currentRune.description = line.split('description:')[1].trim();
            }
        }
        
        // 添加最后一个符文
        if (currentRune) {
            runesData.push(currentRune);
        }
        
        console.log('符文数据加载成功，共加载符文数量:', runesData.length);
        
        // 如果没有加载到符文，尝试使用硬编码的符文数据
        if (runesData.length === 0) {
            console.warn('未从YAML文件加载到符文数据，使用硬编码的符文数据');
            loadHardcodedRunes();
        }
    } catch (error) {
        console.error('加载符文数据失败:', error);
        console.warn('尝试使用硬编码的符文数据');
        loadHardcodedRunes();
    }
}

/**
 * 加载硬编码的符文数据（作为备用）
 */
function loadHardcodedRunes() {
    runesData = [
        {
            name: '智慧符文',
            description: '当你打出附有此符文的卡牌时，抽一张牌。'
        },
        {
            name: '力量符文',
            description: '当你打出附有此符文的卡牌时，对一个目标造成2点伤害。'
        },
        {
            name: '回响符文',
            description: '当你打出附有此符文的卡牌后，复制一张同样的卡牌到你的手牌中。'
        },
        {
            name: '守护符文',
            description: '当你打出附有此符文的卡牌时，获得3点护甲。'
        },
        {
            name: '净化符文',
            description: '当你打出附有此符文的卡牌时，移除一个目标上的所有负面效果。'
        },
        {
            name: '毁灭符文',
            description: '当你打出附有此符文的卡牌时，对所有敌方单位造成1点伤害。'
        },
        {
            name: '洞察符文',
            description: '当你打出附有此符文的卡牌时，查看牌库顶的3张牌，将其中一张加入手牌，其余放回牌库顶。'
        },
        {
            name: '反制符文',
            description: '当对手打出一张法术牌时，你可以弃掉附有此符文的卡牌来取消该法术的效果。'
        },
        {
            name: '武器符文',
            description: '当你打出附有此符文的卡牌时，你的下一次攻击造成额外2点伤害。'
        },
        {
            name: '搜寻符文',
            description: '当你打出附有此符文的卡牌时，从你的牌库中搜索一张卡牌并将其加入手牌。'
        },
        {
            name: '恐惧符文',
            description: '当你打出附有此符文的卡牌时，一个敌方单位本回合无法行动。'
        },
        {
            name: '冥想符文',
            description: '在你的回合结束时，如果你控制附有此符文的卡牌，抽一张牌。'
        },
        {
            name: '隐匿符文',
            description: '当你打出附有此符文的卡牌时，使一个友方单位获得隐身直到你的下个回合。'
        },
        {
            name: '重生符文',
            description: '当附有此符文的卡牌被消灭时，将其返回你的手牌。'
        },
        {
            name: '探险符文',
            description: '当你打出附有此符文的卡牌时，发现一张随机卡牌。'
        },
        {
            name: '爆发符文',
            description: '当你打出附有此符文的卡牌时，本回合内你的下一个法术效果翻倍。'
        },
        {
            name: '旅途符文',
            description: '当你打出附有此符文的卡牌时，将一个友方单位返回你的手牌，并使其费用减少2点。'
        },
        {
            name: '干扰符文',
            description: '当你打出附有此符文的卡牌时，对手的下一张卡牌费用增加2点。'
        },
        {
            name: '预知符文',
            description: '当你打出附有此符文的卡牌时，查看对手手牌中的一张随机卡牌。'
        },
        {
            name: '治愈符文',
            description: '当你打出附有此符文的卡牌时，恢复你的3点生命值。'
        },
        {
            name: '升华符文',
            description: '当你打出附有此符文的卡牌时，使一个友方单位获得+2/+2。'
        },
        {
            name: '引导符文',
            description: '当你打出附有此符文的卡牌时，将一个目标的能量转移到另一个目标上。'
        },
        {
            name: '连接符文',
            description: '当你打出附有此符文的卡牌时，将其与你手牌中的另一张卡牌关联，当其中一张被打出时，自动打出另一张。'
        },
        {
            name: '镜像符文',
            description: '当你打出附有此符文的卡牌时，复制目标单位的能力直到回合结束。'
        }
    ];
    
    console.log('已加载硬编码的符文数据，共', runesData.length, '个符文');
}

/**
 * 初始化所有事件监听器
 */
function initEventListeners() {
    // 图片上传相关
    cardImageUpload.addEventListener('change', handleImageUpload);
    clearImageBtn.addEventListener('click', clearCardImage);
    
    // 符文相关
    addRuneBtn.addEventListener('click', addRuneInput);
    
    // 表单操作
    saveCardBtn.addEventListener('click', saveCard);
    exportCardBtn.addEventListener('click', exportCard);
    clearFormBtn.addEventListener('click', function() {
        clearForm();
        unlockPreview();
    });
    
    // 主题切换
    initThemeToggle();
    
    // 卡组操作
    importDeckBtn.addEventListener('click', () => {
        modalTitle.textContent = '导入卡组';
        exportContent.value = '';
        exportContent.placeholder = '粘贴Markdown格式的卡组...';
        exportContent.readOnly = false;
        copyExportBtn.textContent = '导入';
        copyExportBtn.onclick = importDeckFromModal;
        modal.style.display = 'block';
    });
    
    exportDeckBtn.addEventListener('click', exportDeck);
    clearDeckBtn.addEventListener('click', clearDeck);
    
    // Markdown导入
    importMarkdownBtn.addEventListener('click', importMarkdown);
    
    // 模态框
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    copyExportBtn.addEventListener('click', copyExportContent);
    
    // 实时预览
    cardForm.addEventListener('input', function() {
        if (!previewLocked) {
            updateCardPreview();
        }
    });
    
    // 标签切换功能
    initTabSwitching();
}

/**
 * 初始化标签切换功能
 */
function initTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有标签按钮的active类
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // 移除所有标签面板的active类
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // 添加当前按钮的active类
            button.classList.add('active');
            
            // 获取目标标签面板ID
            const targetId = button.getAttribute('data-tab');
            
            // 显示目标标签面板
            document.getElementById(targetId).classList.add('active');
        });
    });
}

/**
 * 检查卡牌名称是否已存在
 * @param {string} name - 卡牌名称
 * @param {number} excludeIndex - 要排除的卡牌索引（用于编辑现有卡牌时）
 * @returns {boolean} - 如果名称已存在则返回true，否则返回false
 */
function isCardNameExists(name, excludeIndex = -1) {
    return currentDeck.cards.some((card, index) => 
        index !== excludeIndex && card.name.toLowerCase() === name.toLowerCase()
    );
}

/**
 * 锁定预览
 * @param {Object} card - 要锁定预览的卡牌
 * @param {number} index - 卡牌在卡组中的索引，-1表示新卡牌
 */
function lockPreview(card, index = -1) {
    previewLocked = true;
    lockedCard = card;
    editingCardIndex = index;
    
    // 更新预览区域显示锁定的卡牌
    updateCardPreviewWithCard(card);
    
    console.log('预览已锁定:', card.name, '索引:', index);
}

/**
 * 解锁预览
 */
function unlockPreview() {
    previewLocked = false;
    lockedCard = null;
    editingCardIndex = -1;
    
    // 更新预览区域显示当前编辑的卡牌
    updateCardPreview();
    
    console.log('预览已解锁');
}

/**
 * 添加符文输入框
 * @param {string} [selectedRuneName] - 预选的符文名称
 */
function addRuneInput(selectedRuneName = '') {
    // 如果符文数据未加载，显示错误
    if (runesData.length === 0) {
        alert('符文数据未加载，请刷新页面重试');
        return;
    }
    
    const runeInputs = document.querySelectorAll('.rune-select');
    const newIndex = runeInputs.length;
    
    const group = document.createElement('div');
    group.className = 'rune-input-group';
    
    // 创建符文选择下拉框
    const select = document.createElement('select');
    select.id = `rune-${newIndex}`;
    select.className = 'rune-select';
    
    // 添加默认选项
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- 选择符文 --';
    select.appendChild(defaultOption);
    
    // 添加符文选项
    runesData.forEach(rune => {
        const option = document.createElement('option');
        option.value = rune.name;
        option.textContent = rune.name;
        select.appendChild(option);
    });
    
    // 如果有预选符文，设置选中状态
    if (selectedRuneName) {
        select.value = selectedRuneName;
    }
    
    // 添加change事件监听器
    select.addEventListener('change', function() {
        if (!previewLocked) {
            updateCardPreview();
        }
    });
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-small btn-remove';
    removeBtn.textContent = '-';
    removeBtn.onclick = function() {
        this.parentElement.remove();
        if (!previewLocked) {
            updateCardPreview();
        }
    };
    
    group.appendChild(select);
    group.appendChild(removeBtn);
    
    // 在添加按钮之前插入新的输入组
    runeContainer.insertBefore(group, addRuneBtn);
    
    if (!previewLocked) {
        updateCardPreview();
    }
}

/**
 * 处理图片上传
 */
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            cardImagePreview.style.backgroundImage = `url(${e.target.result})`;
            if (!previewLocked) {
                updateCardPreview();
            }
        };
        reader.readAsDataURL(file);
    }
}

/**
 * 清除卡牌图片
 */
function clearCardImage() {
    cardImageUpload.value = '';
    cardImagePreview.style.backgroundImage = '';
    if (!previewLocked) {
        updateCardPreview();
    }
}

/**
 * 获取当前表单中的卡牌数据
 * @returns {Object} 卡牌对象
 */
function getCardFromForm() {
    // 获取卡牌名称
    const name = cardName.value || '未命名卡牌';
    
    // 获取所有元素费用
    const costs = {
        wood: parseInt(costWood.value) || 0,
        fire: parseInt(costFire.value) || 0,
        earth: parseInt(costEarth.value) || 0,
        metal: parseInt(costMetal.value) || 0,
        water: parseInt(costWater.value) || 0
    };
    
    // 获取卡牌图片
    const imageUrl = cardImagePreview.style.backgroundImage.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    
    // 获取描述
    const description = cardDescription.value;
    
    // 获取所有符文
    const runeSelects = document.querySelectorAll('.rune-select');
    const runes = Array.from(runeSelects)
        .map(select => select.value)
        .filter(rune => rune !== '');
    
    return {
        name,
        costs,
        imageUrl,
        description,
        runes
    };
}

/**
 * 获取符文描述
 * @param {string} runeName - 符文名称
 * @returns {string} - 符文描述，如果未找到则返回空字符串
 */
function getRuneDescription(runeName) {
    const rune = runesData.find(r => r.name === runeName);
    return rune ? rune.description : '';
}

/**
 * 更新卡牌预览
 */
function updateCardPreview() {
    const card = getCardFromForm();
    updateCardPreviewWithCard(card);
}

/**
 * 使用指定的卡牌数据更新卡牌预览
 * @param {Object} card - 卡牌对象
 */
function updateCardPreviewWithCard(card) {
    // 更新卡牌名称预览
    cardNamePreview.textContent = card.name;
    
    // 更新费用预览
    cardCostPreview.innerHTML = '';
    
    // 创建元素费用数组，只包含费用大于0的元素
    const elementCosts = [
        { type: 'wood', amount: card.costs.wood, text: '木' },
        { type: 'fire', amount: card.costs.fire, text: '火' },
        { type: 'earth', amount: card.costs.earth, text: '土' },
        { type: 'metal', amount: card.costs.metal, text: '金' },
        { type: 'water', amount: card.costs.water, text: '水' }
    ].filter(element => element.amount > 0);
    
    // 最多显示5个元素位
    const maxElements = Math.min(elementCosts.length, 5);
    
    // 添加元素费用
    for (let i = 0; i < maxElements; i++) {
        const element = elementCosts[i];
        const costBadge = document.createElement('div');
        costBadge.className = `cost-badge cost-${element.type}`;
        costBadge.textContent = element.text;
        
        // 添加费用数量标记
        const costAmount = document.createElement('div');
        costAmount.className = 'cost-amount';
        costAmount.textContent = element.amount;
        costBadge.appendChild(costAmount);
        
        cardCostPreview.appendChild(costBadge);
    }
    
    // 更新卡牌图片
    if (card.imageUrl) {
        cardImagePreview.style.backgroundImage = `url(${card.imageUrl})`;
    } else {
        cardImagePreview.style.backgroundImage = '';
    }
    
    // 更新描述预览
    cardDescriptionPreview.textContent = card.description;
    
    // 更新符文预览
    cardRunesPreview.innerHTML = '';
    if (card.runes && card.runes.length > 0) {
        card.runes.forEach(rune => {
            const runeBadge = document.createElement('div');
            runeBadge.className = 'rune-badge';
            runeBadge.textContent = rune;
            
            // 添加符文描述气泡
            const runeDescription = getRuneDescription(rune);
            if (runeDescription) {
                const tooltip = document.createElement('div');
                tooltip.className = 'rune-tooltip';
                tooltip.textContent = runeDescription;
                runeBadge.appendChild(tooltip);
            }
            
            cardRunesPreview.appendChild(runeBadge);
        });
    }
}

/**
 * 保存卡牌到当前卡组
 */
function saveCard() {
    const card = getCardFromForm();
    
    // 验证必填字段
    if (!card.description) {
        alert('请填写卡牌描述');
        return;
    }
    
    // 如果是编辑现有卡牌
    if (previewLocked && editingCardIndex >= 0) {
        // 检查名称是否与其他卡牌重复
        if (card.name !== currentDeck.cards[editingCardIndex].name && 
            isCardNameExists(card.name, editingCardIndex)) {
            alert('卡组中已存在同名卡牌，请修改卡牌名称');
            return;
        }
        
        // 询问用户是覆盖原卡牌还是创建新卡牌
        const choice = confirm('是否覆盖原卡牌？\n点击"确定"覆盖原卡牌，点击"取消"创建新卡牌');
        
        if (choice) {
            // 覆盖原卡牌
            currentDeck.cards[editingCardIndex] = card;
            alert('卡牌已更新');
        } else {
            // 检查新卡牌名称是否已存在
            if (isCardNameExists(card.name)) {
                alert('卡组中已存在同名卡牌，请修改卡牌名称');
                return;
            }
            
            // 创建新卡牌
            currentDeck.cards.push(card);
            alert('已创建新卡牌');
        }
    } else {
        // 新建卡牌
        // 检查名称是否已存在
        if (isCardNameExists(card.name)) {
            alert('卡组中已存在同名卡牌，请修改卡牌名称');
            return;
        }
        
        // 添加到卡组
        currentDeck.cards.push(card);
        alert('卡牌已保存到卡组');
    }
    
    // 保存到本地存储
    saveDeckToLocalStorage();
    
    // 更新卡组显示
    renderDeck();
    
    // 解锁预览并重置编辑索引
    unlockPreview();
}

/**
 * 导出当前编辑的卡牌
 */
function exportCard() {
    const card = getCardFromForm();
    
    // 验证必填字段
    if (!card.description) {
        alert('请填写卡牌描述');
        return;
    }
    
    // 转换为Markdown
    const markdown = cardToMarkdown(card);
    
    // 显示在模态框中
    modalTitle.textContent = '导出卡牌';
    exportContent.value = markdown;
    exportContent.readOnly = true;
    copyExportBtn.textContent = '复制到剪贴板';
    copyExportBtn.onclick = copyExportContent;
    modal.style.display = 'block';
}

/**
 * 清空表单
 */
function clearForm() {
    // 清空卡牌名称
    cardName.value = '';
    
    // 清空所有元素费用
    costWood.value = '0';
    costFire.value = '0';
    costEarth.value = '0';
    costMetal.value = '0';
    costWater.value = '0';
    
    // 清空卡牌图片
    cardImageUpload.value = '';
    cardImagePreview.style.backgroundImage = '';
    
    // 清空描述
    cardDescription.value = '';
    
    // 清空符文（删除所有符文输入组）
    const runeGroups = document.querySelectorAll('.rune-input-group');
    runeGroups.forEach(group => {
        group.parentElement.removeChild(group);
    });
    
    // 更新预览
    updateCardPreview();
}

/**
 * 导出整个卡组
 */
function exportDeck() {
    if (currentDeck.cards.length === 0) {
        alert('卡组中没有卡牌');
        return;
    }
    
    // 转换为Markdown
    const markdown = deckToMarkdown(currentDeck);
    
    // 显示在模态框中
    modalTitle.textContent = '导出卡组';
    exportContent.value = markdown;
    exportContent.readOnly = true;
    copyExportBtn.textContent = '复制到剪贴板';
    copyExportBtn.onclick = copyExportContent;
    modal.style.display = 'block';
}

/**
 * 从模态框导入卡组
 */
function importDeckFromModal() {
    const markdown = exportContent.value.trim();
    if (!markdown) {
        alert('请输入Markdown格式的卡组');
        return;
    }
    
    try {
        const deck = parseDeckMarkdown(markdown);
        if (deck && deck.cards && deck.cards.length > 0) {
            // 确认是否替换当前卡组
            if (currentDeck.cards.length > 0 && !confirm('这将替换当前卡组，确定继续吗？')) {
                return;
            }
            
            currentDeck = deck;
            saveDeckToLocalStorage();
            renderDeck();
            modal.style.display = 'none';
            alert('卡组导入成功');
        } else {
            alert('无效的卡组格式');
        }
    } catch (error) {
        console.error('导入卡组失败:', error);
        alert('导入卡组失败: ' + error.message);
    }
}

/**
 * 清空当前卡组
 */
function clearDeck() {
    if (currentDeck.cards.length === 0) {
        alert('卡组已经是空的');
        return;
    }
    
    if (confirm('确定要清空卡组吗？此操作不可撤销。')) {
        currentDeck.cards = [];
        saveDeckToLocalStorage();
        renderDeck();
        alert('卡组已清空');
    }
}

/**
 * 从Markdown文本框导入
 */
function importMarkdown() {
    const markdown = markdownContent.value.trim();
    if (!markdown) {
        alert('请输入Markdown格式的卡牌或卡组');
        return;
    }
    
    try {
        const type = detectMarkdownType(markdown);
        
        if (type === 'card') {
            // 导入单张卡牌
            const card = parseCardMarkdown(markdown);
            if (card) {
                // 将卡牌添加到卡组
                currentDeck.cards.push(card);
                saveDeckToLocalStorage();
                renderDeck();
                markdownContent.value = '';
                alert('卡牌导入成功');
            } else {
                alert('无效的卡牌格式');
            }
        } else if (type === 'deck') {
            // 导入卡组
            const deck = parseDeckMarkdown(markdown);
            if (deck && deck.cards && deck.cards.length > 0) {
                // 确认是否替换当前卡组
                if (currentDeck.cards.length > 0 && !confirm('这将替换当前卡组，确定继续吗？')) {
                    return;
                }
                
                currentDeck = deck;
                saveDeckToLocalStorage();
                renderDeck();
                markdownContent.value = '';
                alert('卡组导入成功');
            } else {
                alert('无效的卡组格式');
            }
        } else {
            alert('无法识别的Markdown格式');
        }
    } catch (error) {
        console.error('导入失败:', error);
        alert('导入失败: ' + error.message);
    }
}

/**
 * 复制导出内容到剪贴板
 */
function copyExportContent() {
    exportContent.select();
    document.execCommand('copy');
    alert('已复制到剪贴板');
}

/**
 * 复制卡牌
 * @param {Object} card - 要复制的卡牌
 */
function copyCard(card) {
    // 创建卡牌的深拷贝
    const cardCopy = JSON.parse(JSON.stringify(card));
    
    // 修改卡牌名称，添加"复制"后缀
    let newName = `${cardCopy.name} (复制)`;
    let counter = 1;
    
    // 确保新名称不重复
    while (isCardNameExists(newName)) {
        counter++;
        newName = `${cardCopy.name} (复制 ${counter})`;
    }
    
    cardCopy.name = newName;
    
    // 添加到卡组
    currentDeck.cards.push(cardCopy);
    
    // 保存到本地存储
    saveDeckToLocalStorage();
    
    // 更新卡组显示
    renderDeck();
    
    // 提示用户
    alert(`已复制卡牌: ${cardCopy.name}`);
}

/**
 * 渲染卡组到页面
 */
function renderDeck() {
    deckContainer.innerHTML = '';
    
    if (currentDeck.cards.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = '卡组中没有卡牌';
        deckContainer.appendChild(emptyMessage);
        
        // 重置统计数据
        updateDeckStats();
        return;
    }
    
    currentDeck.cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'deck-card';
        
        // 卡牌名称
        const nameDiv = document.createElement('div');
        nameDiv.className = 'deck-card-name';
        nameDiv.textContent = card.name;
        
        // 卡牌控制按钮
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'deck-card-controls';
        
        // 复制按钮
        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn-small';
        copyBtn.textContent = '复制';
        copyBtn.onclick = function(e) {
            e.stopPropagation();
            copyCard(card);
        };
        
        // 编辑按钮
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-small';
        editBtn.textContent = '编辑';
        editBtn.onclick = function(e) {
            e.stopPropagation();
            
            // 加载卡牌到表单
            loadCardToForm(card);
            
            // 锁定预览
            lockPreview(JSON.parse(JSON.stringify(card)), index);
        };
        
        // 删除按钮
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn-small btn-remove';
        removeBtn.textContent = '删除';
        removeBtn.onclick = function(e) {
            e.stopPropagation();
            removeCardFromDeck(index);
        };
        
        // 按顺序添加按钮
        controlsDiv.appendChild(copyBtn);
        controlsDiv.appendChild(editBtn);
        controlsDiv.appendChild(removeBtn);
        
        // 添加鼠标悬停事件（仅在预览未锁定时生效）
        cardElement.addEventListener('mouseenter', () => {
            if (!previewLocked) {
                // 在预览区域显示悬停的卡牌
                updateCardPreviewWithCard(card);
            }
        });
        
        cardElement.addEventListener('mouseleave', () => {
            if (!previewLocked) {
                // 恢复原来编辑中的卡牌预览
                updateCardPreview();
            }
        });
        
        // 组装卡牌元素
        cardElement.appendChild(nameDiv);
        cardElement.appendChild(controlsDiv);
        
        deckContainer.appendChild(cardElement);
    });
    
    // 更新卡组统计数据
    updateDeckStats();
}

/**
 * 更新卡组统计数据
 */
function updateDeckStats() {
    if (currentDeck.cards.length === 0) {
        // 重置所有统计数据
        document.getElementById('deck-style-value').textContent = '无数据';
        document.getElementById('aggro-value').textContent = '0%';
        document.getElementById('control-value').textContent = '0%';
        document.getElementById('combo-value').textContent = '0%';
        document.getElementById('aggro-bar').style.width = '0%';
        document.getElementById('control-bar').style.width = '0%';
        document.getElementById('combo-bar').style.width = '0%';
        document.getElementById('avg-cost-value').textContent = '0';
        
        // 清空费用分布图
        const costDistribution = document.getElementById('cost-distribution');
        costDistribution.innerHTML = '<div class="cost-axis"></div>';
        
        return;
    }
    
    // 计算卡组风格
    const deckStyle = calculateDeckStyle();
    
    // 更新卡组风格显示
    document.getElementById('deck-style-value').textContent = deckStyle.dominantStyle;
    document.getElementById('aggro-value').textContent = `${Math.round(deckStyle.aggro)}%`;
    document.getElementById('control-value').textContent = `${Math.round(deckStyle.control)}%`;
    document.getElementById('combo-value').textContent = `${Math.round(deckStyle.combo)}%`;
    document.getElementById('aggro-bar').style.width = `${deckStyle.aggro}%`;
    document.getElementById('control-bar').style.width = `${deckStyle.control}%`;
    document.getElementById('combo-bar').style.width = `${deckStyle.combo}%`;
    
    // 计算费用分布
    const costDistribution = calculateCostDistribution();
    
    // 更新平均费用
    document.getElementById('avg-cost-value').textContent = costDistribution.averageCost.toFixed(1);
    
    // 更新费用分布图
    renderCostDistribution(costDistribution.distribution);
}

/**
 * 计算卡组风格
 * @returns {Object} 包含快攻、运营、OTK百分比和主导风格的对象
 */
function calculateDeckStyle() {
    // 初始化风格计数
    let aggroScore = 0;
    let controlScore = 0;
    let comboScore = 0;
    
    // 遍历卡组中的所有卡牌
    currentDeck.cards.forEach(card => {
        // 计算卡牌总费用
        const totalCost = card.costs.wood + card.costs.fire + card.costs.earth + 
                          card.costs.metal + card.costs.water;
        
        // 根据费用判断风格
        if (totalCost <= 2) {
            // 低费卡牌倾向于快攻
            aggroScore += 1;
        } else if (totalCost <= 4) {
            // 中费卡牌各风格都有
            aggroScore += 0.5;
            controlScore += 0.5;
            comboScore += 0.2;
        } else {
            // 高费卡牌倾向于运营或OTK
            controlScore += 0.8;
            comboScore += 0.5;
        }
        
        // 根据符文额外调整风格
        if (card.runes) {
            card.runes.forEach(rune => {
                if (rune.includes('爆发') || rune.includes('力量') || rune.includes('毁灭')) {
                    // 攻击性符文增加快攻和OTK倾向
                    aggroScore += 0.3;
                    comboScore += 0.2;
                } else if (rune.includes('守护') || rune.includes('治愈') || rune.includes('净化')) {
                    // 防御性符文增加运营倾向
                    controlScore += 0.3;
                } else if (rune.includes('回响') || rune.includes('连接') || rune.includes('镜像')) {
                    // 连击性符文增加OTK倾向
                    comboScore += 0.4;
                }
            });
        }
    });
    
    // 计算总分
    const totalScore = aggroScore + controlScore + comboScore;
    
    // 计算百分比
    const aggroPercent = (aggroScore / totalScore) * 100;
    const controlPercent = (controlScore / totalScore) * 100;
    const comboPercent = (comboScore / totalScore) * 100;
    
    // 确定主导风格
    let dominantStyle = '平衡';
    const maxPercent = Math.max(aggroPercent, controlPercent, comboPercent);
    
    if (maxPercent > 40) {
        if (maxPercent === aggroPercent) {
            dominantStyle = '快攻';
        } else if (maxPercent === controlPercent) {
            dominantStyle = '运营';
        } else {
            dominantStyle = 'OTK';
        }
    }
    
    return {
        aggro: aggroPercent,
        control: controlPercent,
        combo: comboPercent,
        dominantStyle: dominantStyle
    };
}

/**
 * 计算费用分布
 * @returns {Object} 包含费用分布和平均费用的对象
 */
function calculateCostDistribution() {
    // 初始化费用分布
    const distribution = {};
    let totalCost = 0;
    let totalCards = currentDeck.cards.length;
    
    // 遍历卡组中的所有卡牌
    currentDeck.cards.forEach(card => {
        // 计算卡牌总费用
        const cost = card.costs.wood + card.costs.fire + card.costs.earth + 
                     card.costs.metal + card.costs.water;
        
        // 更新分布
        distribution[cost] = (distribution[cost] || 0) + 1;
        
        // 累计总费用
        totalCost += cost;
    });
    
    // 计算平均费用
    const averageCost = totalCost / totalCards;
    
    return {
        distribution: distribution,
        averageCost: averageCost
    };
}

/**
 * 渲染费用分布图
 * @param {Object} distribution - 费用分布对象
 */
function renderCostDistribution(distribution) {
    const costDistributionElement = document.getElementById('cost-distribution');
    
    // 清空现有内容
    costDistributionElement.innerHTML = '';
    
    // 添加Y轴标签（数量）
    const yAxisLabel = document.createElement('div');
    yAxisLabel.className = 'axis-label y-axis-label';
    yAxisLabel.textContent = '数量';
    costDistributionElement.appendChild(yAxisLabel);
    
    // 添加X轴标签（费用）
    const xAxisLabel = document.createElement('div');
    xAxisLabel.className = 'axis-label x-axis-label';
    xAxisLabel.textContent = '费用';
    costDistributionElement.appendChild(xAxisLabel);
    
    // 添加坐标轴
    const costAxis = document.createElement('div');
    costAxis.className = 'cost-axis';
    costDistributionElement.appendChild(costAxis);
    
    // 找出最大费用和最大数量
    const maxCost = Math.max(...Object.keys(distribution).map(Number), 7); // 至少显示到7费
    const maxCount = Math.max(...Object.values(distribution), 1); // 确保至少有一个单位高度
    
    // 创建柱状图容器
    const barsContainer = document.createElement('div');
    barsContainer.className = 'bars-container';
    costDistributionElement.appendChild(barsContainer);
    
    // 为每个费用创建柱状图
    for (let cost = 0; cost <= maxCost; cost++) {
        const count = distribution[cost] || 0;
        const height = count > 0 ? (count / maxCount) * 100 : 0;
        
        const barContainer = document.createElement('div');
        barContainer.className = 'bar-container';
        
        const bar = document.createElement('div');
        bar.className = 'cost-bar';
        bar.style.height = `${height}%`;
        bar.setAttribute('data-count', count);
        bar.setAttribute('title', `${cost}费: ${count}张`);
        
        const costLabel = document.createElement('div');
        costLabel.className = 'cost-label';
        costLabel.textContent = cost;
        
        barContainer.appendChild(bar);
        barContainer.appendChild(costLabel);
        barsContainer.appendChild(barContainer);
    }
}

/**
 * 从卡组中删除卡牌
 * @param {number} index - 要删除的卡牌索引
 */
function removeCardFromDeck(index) {
    if (confirm('确定要删除这张卡牌吗？')) {
        currentDeck.cards.splice(index, 1);
        saveDeckToLocalStorage();
        renderDeck();
        
        // 如果预览被锁定，解锁它
        if (previewLocked) {
            unlockPreview();
        }
    }
}

/**
 * 加载卡牌到表单中进行编辑
 * @param {Object} card - 要编辑的卡牌
 */
function loadCardToForm(card) {
    // 清空当前表单
    clearForm();
    
    // 设置卡牌名称
    cardName.value = card.name || '';
    
    // 设置元素费用
    costWood.value = card.costs.wood || 0;
    costFire.value = card.costs.fire || 0;
    costEarth.value = card.costs.earth || 0;
    costMetal.value = card.costs.metal || 0;
    costWater.value = card.costs.water || 0;
    
    // 设置卡牌图片
    if (card.imageUrl) {
        cardImagePreview.style.backgroundImage = `url(${card.imageUrl})`;
    }
    
    // 设置描述
    cardDescription.value = card.description || '';
    
    // 添加符文
    if (card.runes && card.runes.length > 0) {
        card.runes.forEach(rune => {
            addRuneInput(rune);
        });
    }
    
    // 更新预览
    updateCardPreview();
    
    // 滚动到表单位置
    cardForm.scrollIntoView({ behavior: 'smooth' });
}

/**
 * 保存卡组到本地存储
 */
function saveDeckToLocalStorage() {
    try {
        localStorage.setItem('cardEditorDeck', JSON.stringify(currentDeck));
    } catch (error) {
        console.error('保存卡组到本地存储失败:', error);
    }
}

/**
 * 从本地存储加载卡组
 */
function loadDeckFromLocalStorage() {
    try {
        const savedDeck = localStorage.getItem('cardEditorDeck');
        if (savedDeck) {
            currentDeck = JSON.parse(savedDeck);
            renderDeck();
        }
    } catch (error) {
        console.error('从本地存储加载卡组失败:', error);
    }
}

/**
 * 初始化主题切换功能
 */
function initThemeToggle() {
    // 从本地存储加载主题设置
    const savedTheme = localStorage.getItem('cardEditorTheme');
    
    // 如果有保存的主题设置，应用它
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeSwitch.checked = true;
    }
    
    // 添加切换事件监听器
    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            // 切换到黑暗模式
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('cardEditorTheme', 'dark');
        } else {
            // 切换到亮色模式
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('cardEditorTheme', 'light');
        }
    });
}
