from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import random

app = Flask(__name__)
CORS(app) # Разрешаем запросы

DB_FILE = 'bpay_db.json'

# Загрузка базы данных
def load_db():
    if not os.path.exists(DB_FILE):
        return {}
    with open(DB_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

# Сохранение базы данных
def save_db(db):
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(db, f, ensure_ascii=False, indent=4)

# Генерация новой карты
def generate_card():
    num = f"4825 {random.randint(1000,9999)} {random.randint(1000,9999)} {random.randint(1000,9999)}"
    bcode = str(random.randint(100, 999))
    return num, bcode

@app.route('/api/init', methods=['POST'])
def init_user():
    data = request.json
    tg_id = str(data.get('tg_id'))
    name = data.get('name', 'USER')
    
    db = load_db()
    
    # Если новичок — создаем карту
    if tg_id not in db:
        card_num, bcode = generate_card()
        db[tg_id] = {
            "name": name,
            "card_num": card_num,
            "bcode": bcode,
            "balance": 0,
            "banned": False,
            "ban_reason": "",
            "ban_time": ""
        }
        save_db(db)
        
    return jsonify(db[tg_id])

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    if data.get('login') == 'Bpay' and data.get('password') == 'Bpayadminka1557':
        return jsonify({"success": True})
    return jsonify({"success": False}), 401

@app.route('/api/admin/users', methods=['GET'])
def get_users():
    db = load_db()
    # Возвращаем список пользователей для подсказок (автокомплита)
    users = [{"id": k, "name": v["name"]} for k, v in db.items()]
    return jsonify(users)

@app.route('/api/admin/action', methods=['POST'])
def admin_action():
    data = request.json
    action = data.get('action')
    tg_id = str(data.get('tg_id'))
    db = load_db()

    if tg_id not in db:
        return jsonify({"error": "Пользователь не найден"}), 404

    if action == 'topup':
        db[tg_id]['balance'] += float(data.get('amount', 0))
    elif action == 'ban':
        db[tg_id]['banned'] = True
        db[tg_id]['ban_time'] = data.get('duration')
        db[tg_id]['ban_reason'] = data.get('reason')
    elif action == 'unban':
        db[tg_id]['banned'] = False
        db[tg_id]['ban_time'] = ""
        db[tg_id]['ban_reason'] = ""
        
    save_db(db)
    return jsonify({"success": True, "user": db[tg_id]})

if __name__ == '__main__':
    # На хостинге (или в Pydroid) запускаем на 5000 порту
    app.run(host='0.0.0.0', port=5000, debug=True)
