#include "index.h"
#include <sstream>

namespace Domain
{

std::string ProtocolTemplate::generateHtmlTemplate() const
{
    std::stringstream html;

    html << R"(<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Times New Roman', serif;
            font-size: 14px;
            line-height: 1.4;
            padding: 20px 40px;
            background: white;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .header h1 {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .patient-info {
            margin-bottom: 15px;
            padding: 10px;
            background: #f9f9f9;
            border-radius: 5px;
        }
        .patient-info p {
            margin: 3px 0;
        }
        .fields-container {
            margin: 20px 0;
        }
        .field-row {
            display: flex;
            margin: 8px 0;
            align-items: baseline;
        }
        .field-label {
            width: 250px;
            font-weight: bold;
            color: #333;
        }
        .field-value {
            flex: 1;
            border-bottom: 1px solid #333;
            padding: 2px 5px;
            min-height: 20px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ccc;
        }
        .signature-line {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
        }
        .signature-block {
            text-align: center;
        }
        .signature-block .line {
            border-top: 1px solid #333;
            width: 200px;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>)" << title_ << R"(</h1>
    </div>

    <div class="patient-info">
        <p><strong>Пациент:</strong> {{ fio }}</p>
        <p><strong>Дата рождения:</strong> {{ birth_year }}</p>
        <p><strong>Пол:</strong> {{ gender }}</p>
        <p><strong>Дата обследования:</strong> {{ date }}</p>
    </div>

    <div class="fields-container">
)";

    // Maydonlarni tartib bo'yicha chiqarish
    for (const auto& field : fields_) {
        html << "        <div class=\"field-row\">\n";
        html << "            <span class=\"field-label\">" << field->getFieldLabel() << "</span>\n";
        html << "            <span class=\"field-value\">{{ " << field->getFieldName() << " }}</span>\n";
        html << "        </div>\n";
    }

    html << R"(    </div>

    <div class="footer">
        <div class="signature-line">
            <div class="signature-block">
                <p>Врач: {{ vrach }}</p>
                <div class="line"></div>
                <p><small>(подпись)</small></p>
            </div>
            <div class="signature-block">
                <p>Телефон: {{ telefon }}</p>
            </div>
        </div>
    </div>
</body>
</html>)";

    return html.str();
}

}  // namespace Domain
