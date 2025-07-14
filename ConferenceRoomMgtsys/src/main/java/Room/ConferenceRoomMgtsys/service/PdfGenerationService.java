package Room.ConferenceRoomMgtsys.service;

import java.io.ByteArrayOutputStream;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;

@Service
public class PdfGenerationService {

    private static final Logger logger = LoggerFactory.getLogger(PdfGenerationService.class);
    private final TemplateEngine templateEngine;

    public PdfGenerationService() {
        ClassLoaderTemplateResolver templateResolver = new ClassLoaderTemplateResolver();
        templateResolver.setPrefix("templates/reports/");
        templateResolver.setSuffix(".html");
        templateResolver.setTemplateMode(TemplateMode.HTML);
        templateResolver.setCharacterEncoding("UTF-8");

        this.templateEngine = new TemplateEngine();
        this.templateEngine.setTemplateResolver(templateResolver);
    }

    public byte[] generatePdfFromHtml(String templateName, Map<String, Object> data) {
        Context context = new Context();
        context.setVariables(data);
        String html = templateEngine.process(templateName, context);

        // Log the generated HTML for debugging
        logger.debug("Generated HTML for template {}: {}", templateName, html);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();

            // Use a more robust approach for HTML content
            builder.withHtmlContent(html, "/");
            builder.toStream(outputStream);
            builder.run();
            return outputStream.toByteArray();
        } catch (Exception e) {
            logger.error("Error generating PDF for template {}: {}", templateName, e.getMessage(), e);

            // Try with a simpler HTML structure if the original fails
            try {
                logger.info("Attempting to generate PDF with simplified HTML structure");
                return generatePdfWithSimpleHtml(templateName, data);
            } catch (Exception fallbackException) {
                logger.error("Fallback PDF generation also failed: {}", fallbackException.getMessage(),
                        fallbackException);
                throw new RuntimeException("Error generating PDF", e);
            }
        }
    }

    private byte[] generatePdfWithSimpleHtml(String templateName, Map<String, Object> data) throws Exception {
        Context context = new Context();
        context.setVariables(data);
        String html = templateEngine.process(templateName, context);

        // Create a simple, well-formed HTML structure
        String simpleHtml = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head><body>" + html
                + "</body></html>";

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(simpleHtml, "/");
            builder.toStream(outputStream);
            builder.run();
            return outputStream.toByteArray();
        }
    }
}