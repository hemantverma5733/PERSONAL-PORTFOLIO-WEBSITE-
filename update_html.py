import os

files = ['projects.html', 'skills.html', 'certifications.html', 'resume.html', 'admin.html', 'dashboard.html', 'login.html']
directory = '/Users/hemantverma/Desktop/All projects/myself'

script_to_add = """
<script>
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
    }
</script>"""

nav_button = """    <button id="themeToggleBtn" onclick="toggleTheme()" style="background: none; border: none; font-size: 1.3rem; cursor: pointer; color: inherit; margin-left: 1rem; transition: transform 0.3s;">🌓</button>"""

toggle_function = """
    // --- Theme Toggle Logic ---
    function toggleTheme() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        
        const btn = document.getElementById('themeToggleBtn');
        if (btn) {
            btn.style.transform = isLight ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    }
"""

for file in files:
    path = os.path.join(directory, file)
    if not os.path.exists(path):
        continue
    with open(path, 'r') as f:
        content = f.read()

    # 1. Add script after <body>
    if "localStorage.getItem('theme')" not in content:
        content = content.replace('<body>', '<body>' + script_to_add)
        content = content.replace('<body class="no-scroll">', '<body class="no-scroll">' + script_to_add)

    # 2. Add nav toggle
    if 'themeToggleBtn' not in content:
        content = content.replace('</nav>', nav_button + '\n</nav>')

    # 3. Add toggle logic before </script> or </body>
    if 'function toggleTheme' not in content:
        if '</script>' in content:
            # Append before the last </script>
            parts = content.rsplit('</script>', 1)
            content = parts[0] + toggle_function + '\n</script>' + parts[1]
        else:
            # Append before </body>
            content = content.replace('</body>', '<script>' + toggle_function + '</script>\n</body>')

    with open(path, 'w') as f:
        f.write(content)

print("Done updating HTML files.")
