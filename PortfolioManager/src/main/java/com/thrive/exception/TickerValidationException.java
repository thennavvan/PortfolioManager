package com.thrive.exception;

public class TickerValidationException extends RuntimeException {
    public TickerValidationException(String message) {
        super(message);
    }

    public TickerValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
