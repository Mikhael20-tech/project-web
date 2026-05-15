const fs = require('fs');
let code = fs.readFileSync('src/lib/translations.ts', 'utf8');

const idAdditions = `    dash_student_search_placeholder: 'Cari dosen berdasarkan nama atau keahlian...',
    dash_student_database_dosen: 'Database Dosen Pembimbing',
    dash_student_waiting_war: 'MENUNGGU WAR',
    dash_student_access_denied: 'AKSES DITOLAK (ANGKATAN)',
    dash_student_quota_full: 'KUOTA PENUH',
    dash_student_pick_advisor: 'PILIH PEMBIMBING',
    dash_student_system_closed: 'SISTEM DITUTUP (EMERGENCY)',
    dash_student_saving: 'MENYIMPAN...',
    dash_student_save_changes: 'SIMPAN PERUBAHAN',`;

const enAdditions = `    dash_student_search_placeholder: 'Search lecturer by name or expertise...',
    dash_student_database_dosen: 'Advisor Database',
    dash_student_waiting_war: 'WAITING FOR WAR',
    dash_student_access_denied: 'ACCESS DENIED (BATCH)',
    dash_student_quota_full: 'QUOTA FULL',
    dash_student_pick_advisor: 'PICK ADVISOR',
    dash_student_system_closed: 'SYSTEM CLOSED (EMERGENCY)',
    dash_student_saving: 'SAVING...',
    dash_student_save_changes: 'SAVE CHANGES',`;

const zhAdditions = `    dash_student_search_placeholder: '按姓名或专业搜索讲师...',
    dash_student_database_dosen: '导师数据库',
    dash_student_waiting_war: '等待大战',
    dash_student_access_denied: '拒绝访问 (批次)',
    dash_student_quota_full: '名额已满',
    dash_student_pick_advisor: '选择导师',
    dash_student_system_closed: '系统已关闭 (紧急)',
    dash_student_saving: '保存中...',
    dash_student_save_changes: '保存更改',`;

const jaAdditions = `    dash_student_search_placeholder: '名前または専門分野で教員を検索...',
    dash_student_database_dosen: '指導教員データベース',
    dash_student_waiting_war: '争奪戦を待っています',
    dash_student_access_denied: 'アクセス拒否 (バッチ)',
    dash_student_quota_full: '定員満了',
    dash_student_pick_advisor: '指導教員を選択',
    dash_student_system_closed: 'システム閉鎖 (緊急)',
    dash_student_saving: '保存中...',
    dash_student_save_changes: '変更を保存',`;

const koAdditions = `    dash_student_search_placeholder: '이름이나 전문 분야로 교수 검색...',
    dash_student_database_dosen: '지도 교수 데이터베이스',
    dash_student_waiting_war: '전쟁 대기 중',
    dash_student_access_denied: '접근 거부 (배치)',
    dash_student_quota_full: '정원 초과',
    dash_student_pick_advisor: '지도 교수 선택',
    dash_student_system_closed: '시스템 폐쇄 (긴급)',
    dash_student_saving: '저장 중...',
    dash_student_save_changes: '변경 사항 저장',`;

code = code.replace(/dash_student_bio: 'Bio Singkat',/g, 'dash_student_bio: \'Bio Singkat\',\n' + idAdditions);
code = code.replace(/dash_student_bio: 'Short Bio',/g, 'dash_student_bio: \'Short Bio\',\n' + enAdditions);
code = code.replace(/dash_student_bio: '个人简介',/g, 'dash_student_bio: \'个人简介\',\n' + zhAdditions);
code = code.replace(/dash_student_bio: '短い自己紹介',/g, 'dash_student_bio: \'短い自己紹介\',\n' + jaAdditions);
code = code.replace(/dash_student_bio: '짧은 소개',/g, 'dash_student_bio: \'짧은 소개\',\n' + koAdditions);

fs.writeFileSync('src/lib/translations.ts', code, 'utf8');
console.log('Extra translations added.');
