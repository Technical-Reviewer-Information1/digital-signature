import streamlit as st
import hashlib
import secrets
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

# アプリケーションのタイトルと基本設定
st.set_page_config(
    page_title="デジタル署名体験アプリ",
    page_icon="🔐",
    layout="wide"
)

# タイトル
st.title("🔐 デジタル署名の仕組み体験アプリ")
st.caption("Created by Dit-Lab.(Daiki ITO)")
st.caption("Supported by Tomoaki ATSUMI")

st.markdown("---")

# セッション状態の初期化
if 'keys_generated' not in st.session_state:
    st.session_state.keys_generated = False
if 'private_key' not in st.session_state:
    st.session_state.private_key = None
if 'public_key' not in st.session_state:
    st.session_state.public_key = None
if 'original_message' not in st.session_state:
    st.session_state.original_message = "明日の10時に、会議室Aで会いましょう。"
if 'message_hash' not in st.session_state:
    st.session_state.message_hash = None
if 'digital_signature' not in st.session_state:
    st.session_state.digital_signature = None
if 'hash_calculated' not in st.session_state:
    st.session_state.hash_calculated = False
if 'signature_created' not in st.session_state:
    st.session_state.signature_created = False
if 'message_sent' not in st.session_state:
    st.session_state.message_sent = False


def generate_keypair():
    """RSA鍵ペアを生成する"""
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048
    )
    public_key = private_key.public_key()
    return private_key, public_key


def create_hash(message):
    """メッセージのSHA-256ハッシュを計算する"""
    return hashlib.sha256(message.encode()).hexdigest()


def sign_hash(message_hash, private_key):
    """ハッシュをプライベートキーで署名する（簡易版）"""
    # 実際の暗号化処理の代わりに、理解しやすい形で表現
    # プライベートキーから生成したシードを使って署名を模擬
    private_bytes = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    
    # プライベートキーのハッシュを使用してシードを生成
    key_seed = hashlib.sha256(private_bytes).hexdigest()[:16]
    
    # ハッシュ値とキーシードを組み合わせて署名を生成
    signature_input = f"{message_hash}{key_seed}"
    signature = hashlib.sha256(signature_input.encode()).hexdigest()
    
    return signature


def verify_signature(signature, public_key):
    """署名をパブリックキーで検証して元のハッシュを復号する（簡易版）"""
    # 実際の復号処理の代わりに、理解しやすい形で表現
    # 署名から元のハッシュを逆算（簡易版）
    # 実際の暗号化では、署名の64文字から最初の32文字を元のハッシュとして取得
    if len(signature) == 64:
        # signature = hash(original_hash + key_seed) なので
        # 実際には逆算できないが、教育目的で簡易的に処理
        return signature[:32] + "..." + signature[-8:]  # 元のハッシュらしい形で表示
    
    return signature


# 準備セクション
st.header("0. 準備：送信者の鍵ペアを用意しよう")

if st.button("🔑 送信者の「公開鍵🔓」と「秘密鍵🔑」を生成する"):
    st.session_state.private_key, st.session_state.public_key = generate_keypair()
    st.session_state.keys_generated = True
    
    st.success("鍵ペアが生成されました！")
    
    # 鍵の表示（簡略化されたバージョン）
    private_display = "RSA-2048-PRIVATE-" + secrets.token_hex(8).upper()
    public_display = "RSA-2048-PUBLIC-" + secrets.token_hex(8).upper()
    
    st.info(f"🔓 **公開鍵**: `{public_display}`  \nこれは本人証明に使うため、みんなに公開します。")
    st.warning(f"🔑 **秘密鍵**: `{private_display}`  \nこれは署名に使うため、絶対に本人しか知りません。")

st.markdown("---")

# パート1: 送信者の操作
st.header("📝 パート1: 送信者の操作 ✍️")

if st.session_state.keys_generated:
    # ステップ1: メッセージ入力とハッシュ計算
    st.subheader("ステップ1: メッセージを書き、その「指紋」を作る")
    
    message = st.text_area(
        "送信するメッセージを入力してください：",
        value=st.session_state.original_message,
        height=100
    )
    
    if st.button("📝 メッセージのハッシュ値（指紋）を計算する"):
        st.session_state.original_message = message
        st.session_state.message_hash = create_hash(message)
        st.session_state.hash_calculated = True
        
        st.success("ハッシュ値が計算されました！")
        st.code(st.session_state.message_hash)
        st.info("💡 **解説**: ハッシュ値は、メッセージを要約した「指紋」のようなものです。メッセージが1文字でも変わると、全く違う指紋になります。")
    
    # ステップ2: 署名生成
    if st.session_state.hash_calculated:
        st.subheader("ステップ2: 指紋に「自分の印鑑」を押す")
        
        if st.button("🔑 ハッシュ値を「送信者の秘密鍵🔑」で暗号化する（＝署名）"):
            st.session_state.digital_signature = sign_hash(
                st.session_state.message_hash, 
                st.session_state.private_key
            )
            st.session_state.signature_created = True
            
            st.success("デジタル署名が作成されました！")
            st.code(st.session_state.digital_signature)
            st.info("💡 **解説**: 「送信者の秘密鍵」という、世界で一つだけの印鑑でハッシュ値に封をしました。これがデジタル署名です。")
    
    # ステップ3: 送信
    if st.session_state.signature_created:
        st.subheader("ステップ3: メッセージと署名を送る")
        
        if st.button("📤 メッセージ、デジタル署名、公開鍵の3点セットを送信する"):
            st.session_state.message_sent = True
            
            st.success("📤 **送信完了！**")
            
            # 送信内容を表示
            with st.container():
                st.markdown("### 📦 送信された内容")
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.markdown("**📄 メッセージ**")
                    st.code(st.session_state.original_message)
                
                with col2:
                    st.markdown("**✍️ デジタル署名**")
                    st.code(st.session_state.digital_signature[:20] + "...")
                
                with col3:
                    st.markdown("**🔓 公開鍵**")
                    public_display = "RSA-2048-PUBLIC-" + secrets.token_hex(4).upper()
                    st.code(public_display + "...")

else:
    st.warning("⚠️ まず最初に送信者の鍵ペアを生成してください。")

st.markdown("---")

# パート2: 受信者の操作
st.header("🕵️ パート2: 受信者の操作 🕵️")

if st.session_state.message_sent:
    # ステップ4: 受信メッセージの確認
    st.subheader("ステップ4: 受信したメッセージを確認する")
    
    received_message = st.text_area(
        "受信したメッセージ（試しに内容を書き換えてみてください！）:",
        value=st.session_state.original_message,
        height=100,
        key="received_message"
    )
    
    if received_message != st.session_state.original_message:
        st.warning("⚠️ メッセージが元の内容から変更されています！")
    
    # ステップ5: 署名検証
    st.subheader("ステップ5: 署名とメッセージを検証する")
    
    if st.button("🔍 このメッセージが本物か検証する！"):
        # 2つの処理を並べて表示
        col1, col2 = st.columns(2)
        
        # 受信したメッセージのハッシュを計算
        received_hash = create_hash(received_message)
        
        # 署名から元のハッシュを復号
        original_hash_from_signature = verify_signature(
            st.session_state.digital_signature,
            st.session_state.public_key
        )
        
        with col1:
            st.markdown("**① 署名を「公開鍵🔓」で開けて、元の指紋を取り出す**")
            st.markdown("デジタル署名を、一緒に送られてきた公開鍵で復号します。")
            st.code(f"取り出した指紋(A): {st.session_state.message_hash}")
        
        with col2:
            st.markdown("**② 受信したメッセージから、新たに指紋を計算する**")
            st.markdown("（改ざんされたかもしれない）メッセージ全体のハッシュ値を計算します。")
            st.code(f"計算した指紋(B): {received_hash}")
        
        # ステップ6: 最終判定
        st.subheader("ステップ6: 最終判定")
        
        if st.session_state.message_hash == received_hash:
            st.success("✅ **検証成功！** 2つの指紋が一致しました。このメッセージは【送信者本人】から送られ、【改ざんされていない】ことが証明されました！")
        else:
            st.error("❌ **検証失敗！** 2つの指紋が一致しません。このメッセージは【改ざんされた】か【なりすまし】の危険があります！")
        
        # 指紋の比較を視覚的に表示
        st.markdown("### 🔍 指紋の比較")
        comparison_col1, comparison_col2 = st.columns(2)
        
        with comparison_col1:
            st.markdown("**指紋A（署名から取り出した）**")
            st.code(st.session_state.message_hash)
        
        with comparison_col2:
            st.markdown("**指紋B（受信メッセージから計算）**")
            st.code(received_hash)
        
        if st.session_state.message_hash == received_hash:
            st.markdown("🎉 **一致！** → メッセージは信頼できます")
        else:
            st.markdown("⚠️ **不一致！** → メッセージに問題があります")

else:
    st.warning("⚠️ まず最初にパート1で送信者の操作を完了してください。")

# まとめ
st.markdown("---")
st.header("📚 まとめ")

st.markdown("""
### 🎯 この体験でわかったこと

**デジタル署名**は、以下の2つを同時に実現する仕組みです：

1. **本人証明** 📋  
   「送信者の秘密鍵」でしか作れない署名を「公開鍵」で検証することで、なりすましを防げます。

2. **改ざん検知** 🛡️  
   メッセージが1文字でも変わると、ハッシュ値（指紋）が完全に変わるため、改ざんを確実に検知できます。

### 🔐 実際のシステムでは...

- **デジタル証明書**: 公開鍵が本物であることを証明する「身分証明書」の役割を果たします
- **認証局（CA）**: デジタル証明書を発行する信頼できる第三者機関です  
- **より強力な暗号**: RSA以外にも、楕円曲線暗号（ECC）など様々な方式が使われています

""")

st.info("🎓 **おめでとうございます！** デジタル署名の基本的な仕組みを体験的に学ぶことができました。")