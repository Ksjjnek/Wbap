import os
import random
import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# --- НАСТРОЙКА БАЗЫ ДАННЫХ ---
# Вставь сюда URI строку из настроек Supabase (Database -> Connection string -> URI)
# Не забудь заменить [YOUR-PASSWORD] на твой настоящий пароль
DATABASE_URL = "postgresql://postgres:ts5BdN4hvZGnuch@db.zjaeftnfjdcgdrpepvtx.supabase.co:5432/postgres"

def get_db_connection():
    """Создает подключение к PostgreSQL"""
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def init_db():
    """Создает таблицу пользователей, если она еще не существует"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            tg_id TEXT PRIMARY KEY,
            name TEXT,
            card_num TEXT,
            bcode TEXT,
            balance FLOAT DEFAULT 0,
            banned BOOLEAN DEFAULT FALSE,
            ban_reason TEXT DEFAULT '',
            ban_time TEXT DEFAULT ''
        );
    ''')
    conn.commit()
    cur.close()
    conn.close()

# Запускаем инициализацию при старте сервера
init_db()

def generate_card():
    """Генерирует случайный номер карты и BCODE"""
    num = f"4825 {random.randint(1000,9999)} {random.randint(1000,9999)} {random.randint(1000,9999)}"
    bcode = str(random.randint(100, 999))
    return num, bcode

# --- РОУТЫ API ---

@app.route('/api/init', methods=['POST'])
def init_user():
    data = request.json
    tg_id = str(data.get('tg_id'))
    name = data.get('name', 'USER')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Проверяем, есть ли такой пользователь
    cur.execute("SELECT * FROM users WHERE tg_id = %s", (tg_id,))
    user = cur.fetchone()
    
    if not user:
        # Если новичок — генерируем данные
        card_num, bcode = generate_card()
        cur.execute(
            "INSERT INTO users (tg_id, name, card_num, bcode, balance) VALUES (%s, %s, %s, %s, %s) RETURNING *",
            (tg_id, name, card_num, bcode, 0.0)
        )
        user = cur.fetchone()
        conn.commit()
    
    cur.close()
    conn.close()
    return jsonify(user)

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    # Логин и пароль из твоего ТЗ
    if data.get('login') == 'Bpay' and data.get('password') == 'Bpayadminka1557':
        return jsonify({"success": True})
    return jsonify({"success": False}), 401

@app.route('/api/admin/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT tg_id as id, name FROM users")
    users = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(users)

@app.route('/api/admin/action', methods=['POST'])
def admin_action():
    data = request.json
    action = data.get('action')
    tg_id = str(data.get('tg_id'))
    
    conn = get_db_connection()
    cur = conn.cursor()

    # Проверяем существование пользователя
    cur.execute("SELECT * FROM users WHERE tg_id = %s", (tg_id,))
    if not cur.fetchone():
        return jsonify({"error": "Пользователь не найден"}), 404

    if action == 'topup':
        amount = float(data.get('amount', 0))
        cur.execute("UPDATE users SET balance = balance + %s WHERE tg_id = %s", (amount, tg_id))
    
    elif action == 'ban':
        cur.execute(
            "UPDATE users SET banned = TRUE, ban_time = %s, ban_reason = %s WHERE tg_id = %s",
            (data.get('duration'), data.get('reason'), tg_id)
        )
    
    elif action == 'unban':
        cur.execute(
            "UPDATE users SET banned = FALSE, ban_time = '', ban_reason = '' WHERE tg_id = %s",
            (tg_id,)
        )
        
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"success": True})

if __name__ == '__main__':
    # На Render порт берется из переменной окружения
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
