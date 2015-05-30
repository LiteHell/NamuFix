function fontSizeMarkUp(a){

}
editorModifier.addButton('<strong>가</strong>','굵게',WikiText.ToogleWrapSelectedClosure("'''"));
editorModifier.addButton('<i>가</i>','기울게',WikiText.ToogleWrapSelectedClosure("''"));
editorModifier.addButton('<del>가</del>','취소선',WikiText.ToogleWrapSelectedClosure("--"));
editorModifier.addButton('<u>가</u>','밑줄',WikiText.ToogleWrapSelectedClosure("__"));
editorModifier.addButton('가<sub>가</sub>','아랫첨자',WikiText.ToogleWrapSelectedClosure(",,"));
editorModifier.addButton('가<sup>가</sup>','윗첨자',WikiText.ToogleWrapSelectedClosure("^^"));
editorModifier.addButton('<span style="font-size:65%;">가</span>','글씨 작게',fontSizeMarkUp(-1))
