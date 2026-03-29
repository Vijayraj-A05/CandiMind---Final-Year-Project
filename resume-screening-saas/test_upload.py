import requests

files = {'files': ('dummy.pdf', b'%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n111\n%%EOF', 'application/pdf')}
res = requests.post('http://127.0.0.1:8000/api/upload-resumes', files=files)
print(f"Status: {res.status_code}")
print(f"Response: {res.text}")
