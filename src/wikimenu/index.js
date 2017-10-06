module.exports = function(skinName) {
    switch(skinName) {
        case 'senkawa':
            return require('./senkawa');
        case 'liberty':
            return require('./liberty');
        case 'namuvector':
            throw new Error("지원하지 않는 스킨입니다!");
    }
};
