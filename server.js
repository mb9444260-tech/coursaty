const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// رابط الاتصال الخاص بك بـ MongoDB Atlas
const MONGO_URI = "mongodb+srv://mb9444260_db_user:kYVMHTTsoFg4v9SK@coursaty.at4v619.mongodb.net/coursaty_db?retryWrites=true&w=majority";

// الاتصال بقاعدة البيانات
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ تم الاتصال بقاعدة بيانات MongoDB بنجاح!'))
    .catch(err => console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err));

// هيكل قاعدة البيانات (Schema)
const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    sections: [
        {
            sectionTitle: String,
            lessons: [
                {
                    title: String,
                    type: String, // 'video' أو 'audio'
                    url: String
                }
            ]
        }
    ]
});

const Course = mongoose.model('Course', courseSchema);

// واجهة المستخدم (Frontend + Dashboard)
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>منصتي التعليمية الخاصة</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
        <style> body { font-family: 'Cairo', sans-serif; } </style>
    </head>
    <body class="bg-gray-900 text-gray-100 min-h-screen">
        
        <!-- الشريط العلوي -->
        <header class="bg-gray-800 shadow p-4 flex justify-between items-center border-b border-gray-700">
            <h1 class="text-xl font-bold text-emerald-400">🎓 منصتي التعليمية (متصلة بقاعدة البيانات)</h1>
            <span class="text-sm bg-emerald-600 px-3 py-1 rounded-full text-white">أنت الأدمن</span>
        </header>

        <div class="container mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <!-- لوحة التحكم لإضافة محتوى -->
            <div class="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 md:col-span-1">
                <h2 class="text-lg font-bold mb-4 text-emerald-400">➕ إضافة محتوى جديد</h2>
                
                <form id="addCourseForm" class="space-y-4">
                    <div>
                        <label class="block text-sm mb-1">اسم الكورس:</label>
                        <input type="text" id="courseTitle" required class="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-emerald-500">
                    </div>
                    <div>
                        <label class="block text-sm mb-1">وصف الكورس:</label>
                        <textarea id="courseDesc" class="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-emerald-500"></textarea>
                    </div>
                    <hr class="border-gray-700 my-2">
                    <div>
                        <label class="block text-sm mb-1">عنوان القسم (Section):</label>
                        <input type="text" id="sectionTitle" placeholder="مثلاً: القسم الأول" class="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white">
                    </div>
                    <div>
                        <label class="block text-sm mb-1">عنوان الدرس:</label>
                        <input type="text" id="lessonTitle" placeholder="مثلاً: درس مقدمة" class="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white">
                    </div>
                    <div>
                        <label class="block text-sm mb-1">نوع المحتوى:</label>
                        <select id="lessonType" class="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white">
                            <option value="video">فيديو (Video)</option>
                            <option value="audio">فويسات/صوت (Audio)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm mb-1">رابط الملف (فيديو أو صوت):</label>
                        <input type="text" id="lessonUrl" placeholder="رابط مباشر للملف أو يوتيوب" class="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white">
                    </div>
                    <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-2 rounded transition">حفظ في قاعدة البيانات</button>
                </form>
            </div>

            <!-- عرض محتوى المنصة والكورسات -->
            <div class="md:col-span-2 space-y-6">
                <h2 class="text-xl font-bold text-white">📚 الكورسات المخزنة في قاعدة البيانات</h2>
                <div id="coursesContainer" class="space-y-4">
                    <!-- سيتم تحميل الكورسات هنا تلقائياً -->
                </div>
            </div>

        </div>

        <script>
            async function fetchCourses() {
                const res = await fetch('/api/courses');
                const courses = await res.json();
                const container = document.getElementById('coursesContainer');
                container.innerHTML = '';

                if (courses.length === 0) {
                    container.innerHTML = '<p class="text-gray-400">لا توجد كورسات مضافة بعد.</p>';
                    return;
                }

                courses.forEach(course => {
                    let sectionsHtml = '';
                    if(course.sections) {
                        course.sections.forEach(sec => {
                            let lessonsHtml = '';
                            sec.lessons.forEach(les => {
                                if(les.type === 'video') {
                                    lessonsHtml += \`
                                        <div class="bg-gray-900 p-3 rounded mb-2 border border-gray-700">
                                            <p class="text-sm font-semibold mb-1 text-emerald-300">🎥 \${les.title}</p>
                                            <video controls class="w-full rounded h-48 object-cover"><source src="\${les.url}" type="video/mp4">متصفحك لا يدعم الفيديو</video>
                                        </div>
                                    \`;
                                } else {
                                    lessonsHtml += \`
                                        <div class="bg-gray-900 p-3 rounded mb-2 border border-gray-700">
                                            <p class="text-sm font-semibold mb-1 text-blue-300">🎙️ \${les.title}</p>
                                            <audio controls class="w-full"><source src="\${les.url}" type="audio/mp3">متصفحك لا يدعم الصوت</audio>
                                        </div>
                                    \`;
                                }
                            });
                            sectionsHtml += \`
                                <div class="mt-3 bg-gray-700 p-3 rounded">
                                    <h4 class="font-bold text-gray-200 mb-2">📁 \${sec.sectionTitle}</h4>
                                    \${lessonsHtml}
                                </div>
                            \`;
                        });
                    }

                    container.innerHTML += \`
                        <div class="bg-gray-800 p-5 rounded-xl shadow border border-gray-700">
                            <h3 class="text-lg font-bold text-emerald-400">\${course.title}</h3>
                            <p class="text-gray-400 text-sm mb-3">\${course.description || ''}</p>
                            \${sectionsHtml}
                        </div>
                    \`;
                });
            }

            document.getElementById('addCourseForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const newCourse = {
                    title: document.getElementById('courseTitle').value,
                    description: document.getElementById('courseDesc').value,
                    sectionTitle: document.getElementById('sectionTitle').value,
                    lessonTitle: document.getElementById('lessonTitle').value,
                    lessonType: document.getElementById('lessonType').value,
                    lessonUrl: document.getElementById('lessonUrl').value,
                };

                const res = await fetch('/api/courses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newCourse)
                });

                if(res.ok) {
                    alert('تم حفظ البيانات في MongoDB بنجاح!');
                    document.getElementById('addCourseForm').reset();
                    fetchCourses();
                } else {
                    alert('حدث خطأ أثناء الحفظ.');
                }
            });

            fetchCourses();
        </script>
    </body>
    </html>
    `);
});

// API لجلب الكورسات من MongoDB
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: "خطأ في جلب الكورسات" });
    }
});

// API لإضافة كورس/درس جديد في MongoDB
app.post('/api/courses', async (req, res) => {
    try {
        const { title, description, sectionTitle, lessonTitle, lessonType, lessonUrl } = req.body;
        
        let course = await Course.findOne({ title });
        if (!course) {
            course = new Course({ title, description, sections: [] });
        }

        if (sectionTitle && lessonTitle) {
            let section = course.sections.find(s => s.sectionTitle === sectionTitle);
            if (!section) {
                section = { sectionTitle, lessons: [] };
                course.sections.push(section);
            }
            section.lessons.push({ title: lessonTitle, type: lessonType, url: lessonUrl });
        }

        await course.save();
        res.json({ success: true, course });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "خطأ في حفظ البيانات" });
    }
});

app.listen(PORT, () => {
    console.log(`المنصة تعمل الآن على الرابط: http://localhost:${PORT}`);
});