function utils() {
    this.NF_addStyle = (text) => {
        var style = document.createElement("style");
        style.innerHTML = text;
        document.head.appendChild(style);
    }
    this.nOu = (a) => {
        return typeof a === 'undefined' || a == null;
    }

    // HTML 이스케이프 함수
    this.encodeHTMLComponent = (text) => {
        return he.encode(String(text), {useNamedReferences: true});
    }

    this.decodeHTMLComponent = (text) => {
        return he.decode(String(text));
    }

    this.validateIP = (ip) => {
        return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(ip) || /^([0-9a-f]){1,4}(:([0-9a-f]){1,4}){7}$/i.test(ip);
    }

    this.formatDateTime = (t) => {
        var d = new Date(t);
        return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${(['일', '월', '화', '수', '목', '금', '토'])[d.getDay()]}요일 ${ d.getHours() > 12 ? '오후' : '오전'} ${d.getHours() - (d.getHours() > 12 ? 12 : 0)}시 ${d.getMinutes()}분 ${d.getSeconds()}초`;
    }

    this.formatTimespan = (timespan) => {
        var units = [{
                name: "주",
                unit: 60 * 60 * 24 * 7,
                value: 0
            },
            {
                name: "일",
                unit: 60 * 60 * 24,
                value: 0
            },
            {
                name: "시간",
                unit: 60 * 60,
                value: 0
            },
            {
                name: "분",
                unit: 60,
                value: 0
            },
            {
                name: "초",
                unit: 1,
                value: 0
            }
        ];
        for (var i = 0; i < units.length; i++) {
            while (timespan >= units[i].unit) {
                timespan -= units[i].unit;
                units[i].value++;
            }
        }
        return units.filter(function (x) {
            return x.value != 0;
        }).map(function (x) {
            return x.value + x.name
        }).join(' ');
    }

    this.insertCSS = (url) => {
        // 나무위키 CSP 빡세서 getResourceUrl 쓰면 보안 오류남.
        return new Promise((resolve, reject) => {
            GM.xmlHttpRequest({
                method: 'GET',
                url: url,
                onload: (res) => {
                    let styleTag = document.createElement("style");
                    styleTag.innerHTML = res.responseText;
                    document.head.appendChild(styleTag);
                    resolve();
                },
                onerror: reject
            });
        });
    };

    this.enterTimespanPopup = (title, callback) => {
        var win = TooSimplePopup();
        win.title(title);
        win.content(function (winContainer) {
            var units = {
                second: 1,
                minute: 60,
                hour: 60 * 60,
                day: 60 * 60 * 24,
                week: 60 * 60 * 24 * 7,
                month: 60 * 60 * 24 * 7 * 4, // 4 주
                year: 60 * 60 * 24 * 7 * 48 // 48주
            }
            winContainer.innerHTML = '<style>.timespan-container input.timespan-input {width: 60px;}</style><div class="timespan-container">' +
                ' <input type="number" data-unit="year" class="timespan-input" value="0">년' +
                ' <input type="number" data-unit="month" class="timespan-input" value="0">개월' +
                ' <input type="number" data-unit="week" class="timespan-input" value="0">주' +
                ' <input type="number" data-unit="day" class="timespan-input" value="0">일' +
                ' <input type="number" data-unit="hour" class="timespan-input" value="0">시간' +
                ' <input type="number" data-unit="minute" class="timespan-input" value="0">분' +
                ' <input type="number" data-unit="second" class="timespan-input" value="0">초' +
                '</div>';
            win.button('닫기', function () {
                win.close();
                callback(null);
            });
            win.button('입력', function () {
                var result = 0;
                var isNumberic = function (v) {
                    return !isNaN(parseFloat(v)) && isFinite(v);
                } // https://stackoverflow.com/a/9716488
                var timespanInputs = winContainer.querySelectorAll('input.timespan-input')
                for (var i = 0; i < timespanInputs.length; i++) {
                    var timespanInput = timespanInputs[i];
                    if (isNumberic(timespanInput.value)) result += timespanInput.value * units[timespanInput.dataset.unit];
                }
                win.close();
                callback(result);
            })
        });
    }
}